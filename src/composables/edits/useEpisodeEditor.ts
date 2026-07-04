import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService } from '@/api/ContentService';
import { Language, VideoQuality } from '@/api/Enums/Language';
import { TranslationType } from '@/api/Enums/TranslationType';
import { EpisodeService, V1EpisodeQueryRequest } from '@/api/EpisodeService';
import { TranslatorService, V1TranslatorQueryResponseUnit } from '@/api/TranslatorService';
import { generateBigIntId } from '@/helpers/generateId';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { inject, onMounted, ref, type Ref } from 'vue';

type UnitOfSelection = {
    ContentId: string | number;
    Title: string;
};

export function useEpisodeEditor(
    contentId: Ref<string | null>,
    episodeId: Ref<number | null>
) {
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    const injectedContentService = inject<ContentService>('content-service');
    const injectedEpisodeService = inject<EpisodeService>('episode-service');
    const injectedTranslatorService = inject<TranslatorService>('translator-service');
    if (!injectedChangesHistoryService || !injectedContentService || !injectedEpisodeService || !injectedTranslatorService) {
        throw new Error('Edits: провайдеры changes-history-service, content-service, episode-service или translator-service не найдены');
    }
    const changesHistoryApi = injectedChangesHistoryService;
    const contentApi = injectedContentService;
    const episodesApi = injectedEpisodeService;
    const translatorApi = injectedTranslatorService;

    const clientEventStore = ClientEventStore();
    const currentUserStore = userStore();

    const searchContentListV2 = ref<UnitOfSelection[]>([]);
    const contentIsInvalid = ref(false);
    const contentInput = ref('');
    const contentSelectedTitle = ref('');
    const isContentsMenuDropped = ref(false);

    const episodeSelectableValues = ref<string[]>([]);
    const episodeIsInvalid = ref(false);
    const episodeSelectedTitle = ref('');

    let translatorsList: V1TranslatorQueryResponseUnit[] = [];
    const translatorSelectableValues = ref<string[]>([]);
    const translatorInput = ref('');
    const translatorSelectedTitle = ref('');
    const isTranslatorsMenuDropped = ref(false);

    const translationType = ref('');
    const translationTypeIsInvalid = ref(false);
    const translationTypeSelectableValues = [
        TranslationType.Subtitles,
        TranslationType.AutoSubtitles,
        TranslationType.Original,
        TranslationType.VoiceActing,
    ];

    const quality = ref<string | null>(null);

    const language = ref<string>();
    const languageIsInvalid = ref(false);
    const languageSelectableValues = [
        Language.Russian,
        Language.English,
        Language.Korean,
        Language.Chinese,
        Language.Japanese,
    ];

    const videoLink = ref<string>();
    const userInputVideo = ref('');
    const videoScriptIsInvalid = ref(false);

    onMounted(async () => {
        const resolvedContentId = getContentIdOrNull();
        if (resolvedContentId !== null) {
            const contentInfo = await contentApi.V1GetById(
                typeof resolvedContentId === 'number' ? String(resolvedContentId) : resolvedContentId
            );
            searchContentListV2.value = [{ ContentId: contentInfo.Content.Id, Title: contentInfo.Content.Title }];
            contentSelectedTitle.value = contentInfo.Content.Title;
            contentInput.value = contentInfo.Content.Title;
        }

        if (episodeId.value && resolvedContentId !== null) {
            const request = new V1EpisodeQueryRequest();
            request.EpisodeIds = [episodeId.value];
            request.ContentIds = [resolvedContentId];
            request.Limit = 1;

            const episodesQuery = await episodesApi.query(request);
            if (episodesQuery?.length > 0) {
                const episode = episodesQuery[0];
                episodeSelectedTitle.value = episode.Title;
                episodeSelectableValues.value = [episode.Title];
            }
        }
    });

    function getVideoLink() {
        const link = getVideoLinkFromUserInput(userInputVideo.value);
        videoLink.value = link ?? undefined;
        if (link) {
            return;
        }

        videoScriptIsInvalid.value = true;
        clientEventStore.push('Ошибка! Не удалось вывести видео.', EventTypes.Error);
    }

    function getVideoLinkFromUserInput(input: string) {
        if (input.startsWith('<iframe') && input.endsWith('</iframe>')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(input, 'text/html');

            if (doc.documentElement.querySelector('parsererror')) {
                return tryGetFirstLink(input);
            }

            return doc.getElementsByTagName('iframe')[0].src;
        }

        return tryGetFirstLink(input);
    }

    function tryGetFirstLink(userInput: string): string | null {
        const res = userInput.match(/(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (res !== null && res.length > 0) {
            return res[0];
        }

        return null;
    }

    async function onClickUpsertEpisode() {
        const isValidString = (value: string | undefined) => value != null && value.trim() !== '';

        contentIsInvalid.value = !isValidString(contentSelectedTitle.value);
        episodeIsInvalid.value = !isValidString(episodeSelectedTitle.value) || contentIsInvalid.value;
        languageIsInvalid.value = !isValidString(language.value);
        translationTypeIsInvalid.value = !isValidString(translationType.value);
        videoScriptIsInvalid.value = !isValidString(videoLink.value);

        if (
            contentIsInvalid.value ||
            episodeIsInvalid.value ||
            translationTypeIsInvalid.value ||
            languageIsInvalid.value ||
            videoScriptIsInvalid.value
        ) {
            clientEventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error);
            return;
        }

        const content = searchContentListV2.value.find(item => item.Title === contentSelectedTitle.value);
        if (!content) {
            clientEventStore.push('Ошибка! Не удалось определить выбранный контент.', EventTypes.Error);
            return;
        }

        const episode = Number(episodeSelectedTitle.value);
        const languageType = language.value as (typeof Language)[keyof typeof Language];
        const translationTypeValue = translationType.value as (typeof TranslationType)[keyof typeof TranslationType];
        const qualityNumber = quality.value ? Number(quality.value) : null;

        let translatorId: number | null = null;
        if (translatorSelectedTitle.value) {
            translatorId = translatorsList
                .find(translator => translator.Name === translatorSelectedTitle.value)
                ?.TranslatorId
                ?? null;
        }

        const response = await changesHistoryApi.createEpisodeChange({
            GeneratedId: generateBigIntId(),
            ChangeableFields: {
                Number: episode,
                VideoScript: videoLink.value!,
                Language: languageType,
                TranslationType: translationTypeValue,
                EpisodeId: null,
                TranslatorId: translatorId,
                TranslatorName: translatorInput.value,
                Quality: qualityNumber,
            } as never,
            ContentId: content.ContentId,
            CreatedBy: currentUserStore.loggedIn ? currentUserStore.userId : 0,
        });

        if (response.ok) {
            clientEventStore.push('Успех! Данные отправлены. За их статусом можно следить на странице с обновлениями.', EventTypes.Success);
        } else {
            clientEventStore.push('Ошибка! Что-то пошло не так в момент отправки данных, попробуйте еще раз через некоторое время.', EventTypes.Error);
        }
    }

    function getContentIdOrNull(): string | number | null {
        if (contentId.value === null || contentId.value === undefined || contentId.value === '') {
            return null;
        }

        return contentId.value;
    }

    async function onChangeContentInput(newInput: string, isSelected: boolean) {
        isTranslatorsMenuDropped.value = false;
        contentSelectedTitle.value = isSelected ? newInput : '';
        if (newInput.length === 0) {
            searchContentListV2.value = [];
            isContentsMenuDropped.value = false;
            return;
        }

        if (isSelected) {
            const selectedContent = searchContentListV2.value.find(item => item.Title === newInput);
            if (!selectedContent) {
                return;
            }

            const episodesRequest = new V1EpisodeQueryRequest();
            episodesRequest.ContentIds = [selectedContent.ContentId];
            const episodes = await episodesApi.query(episodesRequest);

            episodeSelectableValues.value = episodes.map(ep => ep.Number.toString());
            return;
        }

        episodeSelectableValues.value = [];

        const foundContents = (await contentApi.searchBy(newInput)).Units;
        searchContentListV2.value = foundContents.map(item => ({ Title: item.Title, ContentId: item.ContentId }));
        if (searchContentListV2.value.length > 0) {
            isContentsMenuDropped.value = true;
        }
    }

    async function onChangeTranslatorInput(newInput: string, isSelected: boolean) {
        translatorInput.value = newInput;
        translatorSelectedTitle.value = isSelected ? newInput : '';

        if (newInput.length === 0) {
            translatorsList = [];
            isTranslatorsMenuDropped.value = false;
            return;
        }

        const translatorsResponse = await translatorApi.query({
            Limit: 7,
            Offset: null,
            Search: newInput,
            TranslatorIds: null,
        });
        translatorSelectableValues.value = translatorsResponse.Translators.map(x => x.Name);
        translatorsList = translatorsResponse.Translators;

        if (translatorSelectableValues.value.length > 0) {
            isTranslatorsMenuDropped.value = true;
        }
    }

    return {
        VideoQuality,
        searchContentListV2,
        contentIsInvalid,
        contentInput,
        episodeSelectedTitle,
        episodeIsInvalid,
        isContentsMenuDropped,
        language,
        languageIsInvalid,
        languageSelectableValues,
        translationType,
        translationTypeIsInvalid,
        translationTypeSelectableValues,
        translatorSelectedTitle,
        translatorsList,
        isTranslatorsMenuDropped,
        quality,
        userInputVideo,
        videoLink,
        videoScriptIsInvalid,
        getVideoLink,
        onClickUpsertEpisode,
        onChangeContentInput,
        onChangeTranslatorInput,
    };
}

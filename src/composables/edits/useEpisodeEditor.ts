import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService } from '@/api/ContentService';
import { Language, VideoQuality } from '@/api/Enums/Language';
import { TranslationType } from '@/api/Enums/TranslationType';
import { EpisodeService } from '@/api/EpisodeService';
import { TranslatorService, V1TranslatorQueryResponseUnit } from '@/api/TranslatorService';
import { useEpisodeContentSearch } from '@/composables/edits/useEpisodeContentSearch';
import { episodeEditorDirty } from '@/composables/edits/editsFormDirty';
import { useFormDirtyState } from '@/composables/edits/useFormDirtyState';
import { useVideoScriptParser } from '@/composables/edits/useVideoScriptParser';
import { generateBigIntId } from '@/helpers/generateId';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';

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
    const router = useRouter();

    const {
        searchContentList: searchContentListV2,
        contentIsInvalid,
        contentInput,
        contentSelectedTitle,
        isContentsMenuDropped,
        episodeSelectableValues,
        episodeIsInvalid,
        episodeSelectedTitle,
        loadPrefillContent,
        clearContentSearch,
        onChangeContentInput,
        findSelectedContent,
    } = useEpisodeContentSearch(contentId, episodeId, contentApi, episodesApi);

    const translatorsList = ref<V1TranslatorQueryResponseUnit[]>([]);
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

    const {
        videoLink,
        userInputVideo,
        videoScriptIsInvalid,
        getVideoLink,
        resetVideoScript,
    } = useVideoScriptParser();

    const { isDirty, pauseTracking, resumeTracking, clearDirty } = useFormDirtyState([
        contentInput,
        contentSelectedTitle,
        episodeSelectedTitle,
        translationType,
        quality,
        language,
        userInputVideo,
        translatorSelectedTitle,
        translatorInput,
        videoLink,
    ]);

    watch(isDirty, (value) => {
        episodeEditorDirty.value = value;
    });

    onMounted(async () => {
        pauseTracking();
        if (contentId.value !== null || episodeId.value) {
            await loadPrefillData();
        }
        resumeTracking();
    });

    function clearValidationFlags() {
        contentIsInvalid.value = false;
        episodeIsInvalid.value = false;
        languageIsInvalid.value = false;
        translationTypeIsInvalid.value = false;
        videoScriptIsInvalid.value = false;
    }

    function clearTranslatorFields() {
        translatorsList.value = [];
        translatorSelectableValues.value = [];
        translatorInput.value = '';
        translatorSelectedTitle.value = '';
        isTranslatorsMenuDropped.value = false;
    }

    function clearCreateForm() {
        clearContentSearch();
        clearTranslatorFields();
        translationType.value = '';
        quality.value = null;
        language.value = undefined;
        resetVideoScript();
        clearValidationFlags();
    }

    async function loadPrefillData() {
        await loadPrefillContent();
        clearValidationFlags();
    }

    async function resetForm() {
        pauseTracking();
        if (contentId.value !== null || episodeId.value) {
            clearCreateForm();
            await loadPrefillData();
        } else {
            clearCreateForm();
        }
        resumeTracking();
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

        const content = findSelectedContent();
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
            translatorId = translatorsList.value
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
            },
            ContentId: content.ContentId,
            CreatedBy: currentUserStore.loggedIn ? currentUserStore.userId : 0,
        });

        if (response.ok) {
            clientEventStore.push('Успех! Данные отправлены. За их статусом можно следить на странице с обновлениями.', EventTypes.Success);
            clearDirty();
            await router.push({ name: 'edit-list' });
        } else {
            clientEventStore.push('Ошибка! Что-то пошло не так в момент отправки данных, попробуйте еще раз через некоторое время.', EventTypes.Error);
        }
    }

    async function onChangeContentInputWithReset(newInput: string, isSelected: boolean) {
        isTranslatorsMenuDropped.value = false;
        await onChangeContentInput(newInput, isSelected);
    }

    async function onChangeTranslatorInput(newInput: string, isSelected: boolean) {
        translatorInput.value = newInput;
        translatorSelectedTitle.value = isSelected ? newInput : '';

        if (newInput.length === 0) {
            clearTranslatorFields();
            return;
        }

        const translatorsResponse = await translatorApi.query({
            Limit: 7,
            Offset: null,
            Search: newInput,
            TranslatorIds: null,
        });
        translatorSelectableValues.value = translatorsResponse.Translators.map(x => x.Name);
        translatorsList.value = translatorsResponse.Translators;

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
        resetForm,
        onChangeContentInput: onChangeContentInputWithReset,
        onChangeTranslatorInput,
    };
}

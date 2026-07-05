import { ContentService } from '@/api/ContentService';
import { EpisodeService, V1EpisodeQueryRequest } from '@/api/EpisodeService';
import { ref, type Ref } from 'vue';

export type ContentSelectionUnit = {
    ContentId: string | number;
    Title: string;
};

export function useEpisodeContentSearch(
    contentId: Ref<string | null>,
    episodeId: Ref<number | null>,
    contentApi: ContentService,
    episodesApi: EpisodeService
) {
    const searchContentList = ref<ContentSelectionUnit[]>([]);
    const contentIsInvalid = ref(false);
    const contentInput = ref('');
    const contentSelectedTitle = ref('');
    const isContentsMenuDropped = ref(false);

    const episodeSelectableValues = ref<string[]>([]);
    const episodeIsInvalid = ref(false);
    const episodeSelectedTitle = ref('');

    function getContentIdOrNull(): string | number | null {
        if (contentId.value === null || contentId.value === undefined || contentId.value === '') {
            return null;
        }

        return contentId.value;
    }

    async function loadPrefillContent() {
        const resolvedContentId = getContentIdOrNull();
        if (resolvedContentId !== null) {
            const contentInfo = await contentApi.V1GetById(
                typeof resolvedContentId === 'number' ? String(resolvedContentId) : resolvedContentId
            );
            searchContentList.value = [{ ContentId: contentInfo.Content.Id, Title: contentInfo.Content.Title }];
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
    }

    function clearContentSearch() {
        searchContentList.value = [];
        contentInput.value = '';
        contentSelectedTitle.value = '';
        isContentsMenuDropped.value = false;
        episodeSelectableValues.value = [];
        episodeSelectedTitle.value = '';
        contentIsInvalid.value = false;
        episodeIsInvalid.value = false;
    }

    async function onChangeContentInput(newInput: string, isSelected: boolean) {
        contentSelectedTitle.value = isSelected ? newInput : '';
        if (newInput.length === 0) {
            searchContentList.value = [];
            isContentsMenuDropped.value = false;
            return;
        }

        if (isSelected) {
            const selectedContent = searchContentList.value.find(item => item.Title === newInput);
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
        searchContentList.value = foundContents.map(item => ({ Title: item.Title, ContentId: item.ContentId }));
        if (searchContentList.value.length > 0) {
            isContentsMenuDropped.value = true;
        }
    }

    function findSelectedContent(): ContentSelectionUnit | undefined {
        return searchContentList.value.find(item => item.Title === contentSelectedTitle.value);
    }

    return {
        searchContentList,
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
    };
}

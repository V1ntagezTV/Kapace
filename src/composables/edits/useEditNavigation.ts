import { SettingsPageTypes } from '@/models/SettingsPageTypes';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const ROUTE_PAGE_MAP: Record<string, SettingsPageTypes> = {
    'edit-list': SettingsPageTypes.Edits,
    'create-content': SettingsPageTypes.CreateContent,
    'edit-content': SettingsPageTypes.EditContent,
    'create-episode': SettingsPageTypes.CreateEpisode,
    'edit-episode': SettingsPageTypes.EditEpisode,
    'edit-episode-prefill': SettingsPageTypes.EditEpisode,
};

function parseRouteParam(routeParam: string | string[] | undefined): string | null {
    if (routeParam === undefined) {
        return null;
    }

    return Array.isArray(routeParam) ? routeParam[0] : routeParam;
}

export function useEditNavigation() {
    const route = useRoute();

    const selectedPage = computed(
        () => ROUTE_PAGE_MAP[route.name as string] ?? SettingsPageTypes.Edits
    );

    const contentId = computed(() => parseRouteParam(route.params.content));

    const episodeId = computed(() => {
        const episodeParam = parseRouteParam(route.params.episode);
        return episodeParam ? Number(episodeParam) : null;
    });

    const isListPage = computed(() => selectedPage.value === SettingsPageTypes.Edits);

    const isContentEditorPage = computed(
        () =>
            selectedPage.value === SettingsPageTypes.CreateContent ||
            selectedPage.value === SettingsPageTypes.EditContent
    );

    const isEpisodeEditorPage = computed(
        () =>
            selectedPage.value === SettingsPageTypes.CreateEpisode ||
            selectedPage.value === SettingsPageTypes.EditEpisode
    );

    const isEditingContent = computed(
        () => selectedPage.value === SettingsPageTypes.EditContent
    );

    const isEditingEpisode = computed(
        () => selectedPage.value === SettingsPageTypes.EditEpisode
    );

    const contentPageTitle = computed(() => {
        if (isEditingContent.value && contentId.value) {
            return `Редактирование контента #${contentId.value}`;
        }
        return 'Новый контент';
    });

    const episodePageTitle = computed(() => {
        if (isEditingEpisode.value && episodeId.value && contentId.value) {
            return `Редактирование эпизода #${episodeId.value}`;
        }
        if (isEditingEpisode.value && contentId.value) {
            return `Новый эпизод для контента #${contentId.value}`;
        }
        return 'Новый эпизод';
    });

    return {
        selectedPage,
        contentId,
        episodeId,
        isListPage,
        isContentEditorPage,
        isEpisodeEditorPage,
        isEditingContent,
        isEditingEpisode,
        contentPageTitle,
        episodePageTitle,
    };
}

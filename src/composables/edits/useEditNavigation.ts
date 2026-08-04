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
    'create-person': SettingsPageTypes.CreatePerson,
    'edit-person': SettingsPageTypes.EditPerson,
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

    const personId = computed(() => parseRouteParam(route.params.person));

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

    const isPersonEditorPage = computed(
        () =>
            selectedPage.value === SettingsPageTypes.CreatePerson ||
            selectedPage.value === SettingsPageTypes.EditPerson
    );

    const isEditingContent = computed(
        () => selectedPage.value === SettingsPageTypes.EditContent
    );

    const isEditingEpisode = computed(
        () => selectedPage.value === SettingsPageTypes.EditEpisode
    );

    const isEditingPerson = computed(
        () => selectedPage.value === SettingsPageTypes.EditPerson
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

    const personPageTitle = computed(() => {
        if (isEditingPerson.value && personId.value) {
            return `Редактирование персоны #${personId.value}`;
        }
        return 'Новая персона';
    });

    return {
        selectedPage,
        contentId,
        episodeId,
        personId,
        isListPage,
        isContentEditorPage,
        isEpisodeEditorPage,
        isPersonEditorPage,
        isEditingContent,
        isEditingEpisode,
        isEditingPerson,
        contentPageTitle,
        episodePageTitle,
        personPageTitle,
    };
}

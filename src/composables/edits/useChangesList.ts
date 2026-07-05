import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService, V1SearchByResponseUnit } from '@/api/ContentService';
import { ChangeUnit } from '@/api/Responses/V1GetChangesComparisonsResponse';
import {
    CHANGES_LIST_PAGE_SIZE,
    DEFAULT_CHANGES_HISTORY_TYPE,
    DEFAULT_CHANGES_ORDER_BY,
    DEFAULT_CHANGES_STATUS,
    toApprovedStatus,
    toHistoryTypes,
    toOrderByType,
} from '@/models/edits/ChangesListFilters';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export { CHANGES_LIST_PAGE_SIZE };

export function useChangesList() {
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    const injectedContentService = inject<ContentService>('content-service');
    if (!injectedChangesHistoryService || !injectedContentService) {
        throw new Error('Edits: провайдеры changes-history-service или content-service не найдены');
    }
    const changesHistoryService = injectedChangesHistoryService;
    const contentService = injectedContentService;

    const clientEventStore = ClientEventStore();
    const router = useRouter();
    const currentUserStore = userStore();

    const searchSelectableValueModels = ref<V1SearchByResponseUnit[]>([]);
    const filters = {
        contentIds: ref<number[]>([]),
        orderBy: ref<string>(DEFAULT_CHANGES_ORDER_BY),
        historyType: ref<string>(DEFAULT_CHANGES_HISTORY_TYPE),
        status: ref<string>(DEFAULT_CHANGES_STATUS),
        isMy: ref<boolean | null>(null),
    };

    const dataIsReady = ref(false);
    const changes = ref<ChangeUnit[]>([]);
    const isSearchMenuDropped = ref(false);
    const offset = ref(0);

    const hasNextPage = computed(
        () => dataIsReady.value && changes.value.length >= CHANGES_LIST_PAGE_SIZE
    );

    onMounted(async () => {
        await resetAndLoad();
    });

    async function loadChanges() {
        dataIsReady.value = false;

        const response = await changesHistoryService.getChangesComparisons({
            Approved: toApprovedStatus(filters.status.value),
            CreatedByIds: filters.isMy.value && currentUserStore.loggedIn ? [currentUserStore.userId] : [],
            HistoryTypes: toHistoryTypes(filters.historyType.value),
            OrderBy: toOrderByType(filters.orderBy.value),
            Ids: [],
            Limit: CHANGES_LIST_PAGE_SIZE,
            Offset: offset.value,
            TargetIds: filters.contentIds.value ?? [],
        });

        changes.value = response.data?.Changes ?? [];
        dataIsReady.value = true;
    }

    async function resetAndLoad() {
        offset.value = 0;
        await loadChanges();
    }

    async function changePage(delta: number) {
        const newOffset = offset.value + delta;
        if (newOffset < 0) {
            return;
        }

        offset.value = newOffset;
        await loadChanges();
    }

    async function clickOnMineFilter() {
        if (currentUserStore.loggedIn) {
            filters.isMy.value = !filters.isMy.value;
            await resetAndLoad();
            return;
        }

        clientEventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error);
    }

    async function approveClick(historyId: string) {
        if (!currentUserStore.loggedIn) {
            clientEventStore.push('Для начала необходимо авторизоваться!', EventTypes.Error);
            await router.push('/login');
            return;
        }

        const userId = currentUserStore.userId;
        const unit = changes.value.find(change => change.HistoryId === historyId);

        const response = (await changesHistoryService.approve(historyId, userId))
            .onException(() => clientEventStore.push('Ошибка сервера! Заявка не одобрена.', EventTypes.Error))
            .onBusinessError((error) => clientEventStore.push(error.Message, EventTypes.Error));

        if (response.data && unit) {
            unit.ApprovedAt = Date.now();
            unit.ApprovedBy = userId;
            clientEventStore.push('Успех! Одобрено!', EventTypes.Success);
        }
    }

    function getVideoLinkByChangesComparisons(unit: ChangeUnit): string {
        return unit.FieldsComparisons.find(field => field.Name === 'Видео')?.NewValue ?? '';
    }

    async function pressEnterSearch(input: string) {
        searchSelectableValueModels.value = [];

        const foundedContents = await contentService.searchBy(input);
        filters.contentIds.value = foundedContents.Units.map(c => c.ContentId);
        await resetAndLoad();
    }

    async function searchByInput(input: string, isSelected: boolean) {
        const response = await contentService.searchBy(input);
        searchSelectableValueModels.value = response.Units;

        if (isSelected) {
            const selected = searchSelectableValueModels.value.find(content => content.Title === input);
            if (selected) {
                filters.contentIds.value = [selected.ContentId];
                await resetAndLoad();
            }
        }

        isSearchMenuDropped.value = searchSelectableValueModels.value.length > 0;
    }

    return {
        currentUserStore,
        searchSelectableValueModels,
        filters,
        dataIsReady,
        changes,
        isSearchMenuDropped,
        offset,
        hasNextPage,
        pageSize: CHANGES_LIST_PAGE_SIZE,
        resetAndLoad,
        changePage,
        clickOnMineFilter,
        approveClick,
        getVideoLinkByChangesComparisons,
        pressEnterSearch,
        searchByInput,
    };
}

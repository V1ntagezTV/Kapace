import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService, V1SearchByResponseUnit } from '@/api/ContentService';
import { HistoryChangesOrderType, HistoryType } from '@/api/Enums/HistoryType';
import { V1GetChangesComparisonsRequest } from '@/api/Requests/V1GetChangesComparisonsRequest';
import { ChangeUnit } from '@/api/Responses/V1GetChangesComparisonsResponse';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const LIMIT = 5;

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
        search: ref<string | null>(null),
        orderBy: ref<string | null>('По умолчанию'),
        historyType: ref<string | null>(''),
        status: ref<string | null>(''),
        isMy: ref<boolean | null>(null),
    };

    const dataIsReady = ref(false);
    const changes = ref<ChangeUnit[]>();
    const isSearchMenuDropped = ref(false);
    const offset = ref(0);

    onMounted(async () => {
        dataIsReady.value = false;
        await updatePage(0);
        dataIsReady.value = true;
    });

    async function updatePage(addOffset: number = 0) {
        dataIsReady.value = false;

        if (addOffset < 0 && offset.value + addOffset <= 0) {
            offset.value = 0;
        } else {
            offset.value += addOffset;
        }

        const response = await changesHistoryService.getChangesComparisons({
            Approved: getApprovedStatus(filters.status.value),
            CreatedByIds: filters.isMy.value && currentUserStore.loggedIn ? [currentUserStore.userId] : [],
            HistoryTypes: getHistoryTypes(filters.historyType.value),
            OrderBy: getOrderByType(filters.orderBy.value),
            Ids: [],
            Limit: LIMIT,
            Offset: offset.value,
            TargetIds: filters.contentIds.value ?? [],
        } as unknown as V1GetChangesComparisonsRequest);

        changes.value = response.data?.Changes ?? [];
        dataIsReady.value = true;
    }

    function getApprovedStatus(filterStatus: string | null): boolean | null {
        if (filterStatus === 'По умолчанию') {
            return null;
        }
        if (filterStatus === 'Не одобрено') {
            return false;
        }
        if (filterStatus === 'Одобрено') {
            return true;
        }
        return null;
    }

    function getHistoryTypes(value: string | null) {
        if (value === 'Серия') {
            return [HistoryType.Episode];
        }
        if (value === 'Дорама') {
            return [HistoryType.Content];
        }
        return [];
    }

    function getOrderByType(selectedOrder: string | null) {
        if (selectedOrder === 'Сначала старые') {
            return HistoryChangesOrderType.ByCreated;
        }
        if (selectedOrder === 'По названию') {
            return HistoryChangesOrderType.ByName;
        }
        if (selectedOrder === 'По идентификатору') {
            return HistoryChangesOrderType.ById;
        }
        if (selectedOrder === 'Сначала новые') {
            return HistoryChangesOrderType.ByCreatedDescending;
        }
        return HistoryChangesOrderType.Unspecified;
    }

    async function clickOnMineFilter() {
        if (currentUserStore.loggedIn) {
            filters.isMy.value = !filters.isMy.value;
            await updatePage(0);
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
        const unit = changes.value?.find(change => change.HistoryId === historyId);

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
        await updatePage();
    }

    async function searchByInput(input: string, isSelected: boolean) {
        const response = await contentService.searchBy(input);
        searchSelectableValueModels.value = response.Units;

        if (isSelected) {
            const selected = searchSelectableValueModels.value.find(content => content.Title === input);
            if (selected) {
                filters.contentIds.value = [selected.ContentId];
                await updatePage();
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
        updatePage,
        clickOnMineFilter,
        approveClick,
        getVideoLinkByChangesComparisons,
        pressEnterSearch,
        searchByInput,
    };
}

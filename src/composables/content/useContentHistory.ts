import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService } from '@/api/ContentService';
import { HistoryChangesOrderType, HistoryType } from '@/api/Enums/HistoryType';
import { ChangeUnit } from '@/api/Responses/V1GetChangesComparisonsResponse';
import { computed, inject, onMounted, ref, type Ref } from 'vue';

export const CONTENT_HISTORY_PAGE_SIZE = 10;

export type ChangeApprovalStatus = 'approved' | 'pending' | 'rejected';

export function getChangeApprovalStatus(unit: ChangeUnit): ChangeApprovalStatus {
    if (unit.ApprovedBy === null) {
        return 'pending';
    }

    if (unit.ApprovedBy < 0) {
        return 'rejected';
    }

    return 'approved';
}

function normalizeTimestampToMs(value: number): number {
    return value < 1_000_000_000_000 ? value * 1000 : value;
}

export function formatHistoryDate(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }

    const date = new Date(normalizeTimestampToMs(value));
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export function useContentHistory(contentId: Ref<string>) {
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    const injectedContentService = inject<ContentService>('content-service');

    if (!injectedChangesHistoryService || !injectedContentService) {
        throw new Error('ContentHistory: провайдеры changes-history-service или content-service не найдены');
    }

    const changesHistoryService = injectedChangesHistoryService;
    const contentService = injectedContentService;

    const dataIsReady = ref(false);
    const changes = ref<ChangeUnit[]>([]);
    const contentTitle = ref<string>('');
    const offset = ref(0);
    const hideUnapproved = ref(false);

    const hasNextPage = computed(
        () => dataIsReady.value && changes.value.length >= CONTENT_HISTORY_PAGE_SIZE
    );

    async function loadContentTitle() {
        try {
            const details = await contentService.V1GetById(contentId.value);
            contentTitle.value = details.Content.Title ?? '';
        } catch {
            contentTitle.value = '';
        }
    }

    async function loadChanges() {
        dataIsReady.value = false;

        const numericContentId = Number(contentId.value);
        if (Number.isNaN(numericContentId)) {
            changes.value = [];
            dataIsReady.value = true;
            return;
        }

        const response = await changesHistoryService.getChangesComparisons({
            Approved: hideUnapproved.value ? true : null,
            CreatedByIds: [],
            HistoryTypes: [HistoryType.Content],
            OrderBy: HistoryChangesOrderType.ByCreatedDescending,
            Ids: [],
            Limit: CONTENT_HISTORY_PAGE_SIZE,
            Offset: offset.value,
            TargetIds: [numericContentId],
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

    onMounted(async () => {
        await Promise.all([
            loadContentTitle(),
            resetAndLoad(),
        ]);
    });

    return {
        dataIsReady,
        changes,
        contentTitle,
        offset,
        hideUnapproved,
        hasNextPage,
        pageSize: CONTENT_HISTORY_PAGE_SIZE,
        resetAndLoad,
        changePage,
        formatHistoryDate,
        getChangeApprovalStatus,
    };
}

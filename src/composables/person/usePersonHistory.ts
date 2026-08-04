import { PersonService } from '@/api/PersonService';
import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { HistoryChangesOrderType, HistoryType } from '@/api/Enums/HistoryType';
import { ChangeUnit } from '@/api/Responses/V1GetChangesComparisonsResponse';
import { computed, inject, onMounted, ref, type Ref } from 'vue';

export const PERSON_HISTORY_PAGE_SIZE = 10;

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

export function usePersonHistory(personId: Ref<string>) {
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    const injectedPersonService = inject<PersonService>('person-service');

    if (!injectedChangesHistoryService || !injectedPersonService) {
        throw new Error('PersonHistory: провайдеры changes-history-service или person-service не найдены');
    }

    const changesHistoryService = injectedChangesHistoryService;
    const personService = injectedPersonService;

    const dataIsReady = ref(false);
    const changes = ref<ChangeUnit[]>([]);
    const personTitle = ref<string>('');
    const offset = ref(0);
    const hideUnapproved = ref(false);

    const hasNextPage = computed(
        () => dataIsReady.value && changes.value.length >= PERSON_HISTORY_PAGE_SIZE
    );

    async function loadPersonTitle() {
        try {
            const details = await personService.getById(personId.value);
            personTitle.value = details.Person.Name ?? '';
        } catch {
            personTitle.value = '';
        }
    }

    async function loadChanges() {
        dataIsReady.value = false;

        const numericPersonId = Number(personId.value);
        if (Number.isNaN(numericPersonId)) {
            changes.value = [];
            dataIsReady.value = true;
            return;
        }

        const response = await changesHistoryService.getChangesComparisons({
            Approved: hideUnapproved.value ? true : null,
            CreatedByIds: [],
            HistoryTypes: [HistoryType.Person],
            OrderBy: HistoryChangesOrderType.ByCreatedDescending,
            Ids: [],
            Limit: PERSON_HISTORY_PAGE_SIZE,
            Offset: offset.value,
            TargetIds: [numericPersonId],
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
            loadPersonTitle(),
            resetAndLoad(),
        ]);
    });

    return {
        dataIsReady,
        changes,
        personTitle,
        offset,
        hideUnapproved,
        hasNextPage,
        pageSize: PERSON_HISTORY_PAGE_SIZE,
        resetAndLoad,
        changePage,
        formatHistoryDate,
        getChangeApprovalStatus,
    };
}

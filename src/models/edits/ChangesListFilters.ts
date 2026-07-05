import {
    HistoryChangesOrderType,
    HistoryType,
    type HistoryChangesOrderTypeValue,
    type HistoryTypeValue,
} from '@/api/Enums/HistoryType';

export const CHANGES_LIST_PAGE_SIZE = 5;

export const CHANGES_ORDER_BY_OPTIONS = [
    'По идентификатору',
    'По названию',
    'Сначала новые',
    'Сначала старые',
] as const;

export const CHANGES_HISTORY_TYPE_OPTIONS = ['Все', 'Дорама', 'Серия'] as const;

export const CHANGES_STATUS_OPTIONS = ['Все', 'Не одобрено', 'Одобрено'] as const;

export const DEFAULT_CHANGES_ORDER_BY = CHANGES_ORDER_BY_OPTIONS[0];
export const DEFAULT_CHANGES_HISTORY_TYPE = CHANGES_HISTORY_TYPE_OPTIONS[0];
export const DEFAULT_CHANGES_STATUS = CHANGES_STATUS_OPTIONS[0];

export type ChangesOrderByOption = (typeof CHANGES_ORDER_BY_OPTIONS)[number];
export type ChangesHistoryTypeOption = (typeof CHANGES_HISTORY_TYPE_OPTIONS)[number];
export type ChangesStatusOption = (typeof CHANGES_STATUS_OPTIONS)[number];

export function toApprovedStatus(filterStatus: string | null): boolean | null {
    if (filterStatus === 'Все' || filterStatus === 'По умолчанию' || !filterStatus) {
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

export function toHistoryTypes(value: string | null): HistoryTypeValue[] {
    if (value === 'Серия') {
        return [HistoryType.Episode];
    }
    if (value === 'Дорама') {
        return [HistoryType.Content];
    }
    return [];
}

export function toOrderByType(selectedOrder: string | null): HistoryChangesOrderTypeValue {
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

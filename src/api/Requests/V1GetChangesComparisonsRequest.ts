import {HistoryChangesOrderType, HistoryType, type HistoryChangesOrderTypeValue, type HistoryTypeValue} from "@/api/Enums/HistoryType";

export type V1GetChangesComparisonsRequest = {
     readonly Ids: number[],
     readonly TargetIds: number[],
     readonly CreatedByIds: number[],
     readonly HistoryTypes: HistoryTypeValue[],
     readonly OrderBy: HistoryChangesOrderTypeValue,
     readonly Approved: boolean | null,
     readonly Limit: number,
     readonly Offset: number
}
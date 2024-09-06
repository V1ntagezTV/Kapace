import {HistoryType} from "@/api/Enums/HistoryType";

export type V1GetChangesComparisonsRequest = {
     readonly Ids: number[],
     readonly TargetIds: number[],
     readonly CreatedByIds: number[],
     readonly HistoryTypes: typeof HistoryType[],
     readonly Approved: boolean,
     readonly Limit: number,
     readonly Offset: number
}
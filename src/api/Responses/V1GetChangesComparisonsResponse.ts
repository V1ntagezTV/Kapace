import { HistoryType } from "../Enums/HistoryType"

export type V1GetChangesComparisonsResponse = {
     Changes: ChangeUnit[]
}

export type ChangeUnit = {
    HistoryId: string
    TargetId: number | null
    AvatarImageLink: string | null
    ImageIds?: number[] | null
    HistoryType: typeof HistoryType
    FieldsComparisons: { Name: string, OldValue: string, NewValue: string }[]
    Title: string | null
    Text: string | null
    CreatedBy: number
    CreatedAt: number
    ApprovedBy: number | null
    ApprovedAt: number | null
}
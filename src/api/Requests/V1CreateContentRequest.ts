import {ContentType} from "../Enums/ContentType"
import {Country} from "../Enums/Country"
import {ContentStatus} from "@/api/Enums/ContentStatus";

export type V1CreateContentRequest = {
    readonly GeneratedId: bigint | null
    readonly ContentId: bigint,
    readonly ChangeableFields: V1ChangeableFields,
    readonly CreatedBy: number
}

export type V1ChangeableFields = {
    PortraitImageName: string | null,
    AdditionalImageNames: string[] | null,
    Title: string | null,
    EngTitle: string | null,
    OriginalTitle: string | null,
    Description: string | null,
    Country: typeof Country | null,
    ContentType: typeof ContentType | null,
    ContentStatus: typeof ContentStatus | null,
    Genres: string[] | null,
    Duration: number | null,
    ReleasedAt: string | null,
    PlannedSeries: number | null,
    MinAge: number | null,
    Channel: string | null
}
import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {Country as CountryEnum} from "@/api/Enums/Country";

export type QueryContent = {
    Id: number,
    Title: string,
    EngTitle: string,
    OriginTitle: string,
    Description: string,
    Type: typeof ContentType,
    Status: typeof ContentStatus | null,
    ImageId: number,
    ImportStars: number,
    OutSeries: number,
    PlannedSeries: number,
    Views: number,
    Country: typeof CountryEnum,
    ReleasedAt: number | null,
    CreatedAt: number,
    LastUpdateAt: number,
    MinAgeLimit: number,
    Duration: number | null,
}
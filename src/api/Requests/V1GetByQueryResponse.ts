import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import { TranslationType } from "../Enums/TranslationType";
import { Country } from "../Enums/Country";

export type V1GetByQueryResponse = {
    Contents: Array<V1GetByQueryResponseContent>
}

export type V1GetByQueryResponseContent = {
    Id: number,
    Title: string,
    EngTitle: string,
    OriginTitle: string,
    Description: string,
    Type: ContentType,
    Status: ContentStatus,
    Image: string,
    ImportStars: number,
    OutSeries: number,
    PlannedSeries: number,
    Views: number,
    Country: typeof Country,
    ReleasedAt: number,
    CreatedAt: number,
    LastUpdateAt: number,
    MinAgeLimit: number,
    Duration: number | null,
    Translations: Array<V1GetByQueryResponseTranslation>,
    Episodes: Array<V1GetByQueryResponseEpisode>,
    Genres: Array<V1GetByQueryResponseGenre>,
}

export type V1GetByQueryResponseTranslation = {
    Id: number,
    EpisodeId: number,
    ContentId: number,
    Language: number,
    Link: string,
    TranslationType: typeof TranslationType,
    CreatedAt: number
    CreatedBy: number | null
}

export type V1GetByQueryResponseEpisode = {
    Id: number,
    ContentId: number,
    Title: string
    Image: string
    Number: number,
}

export type V1GetByQueryResponseGenre = {
    ContentId: number
    GenreId: number
    Name: string
    CreatedAt: number
    CreatedBy: number | null
}
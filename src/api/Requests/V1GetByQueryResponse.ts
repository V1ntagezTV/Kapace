import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import { TranslationType } from "../Enums/TranslationType";
import { Country as CountryEnum } from "../Enums/Country";
import {Language} from "@/api/Enums/Language";

export type V1GetByQueryResponse = {
    Content: Array<V1GetByQueryResponseContent>
}

export class V1GetByQueryResponseContent {
    constructor(
        public Id: number,
        public Title: string,
        public EngTitle: string,
        public OriginTitle: string,
        public Description: string,
        public Type: typeof ContentType,
        public Status: typeof ContentStatus,
        public ImageId: number,
        public ImportStars: number,
        public OutSeries: number,
        public PlannedSeries: number,
        public Views: number,
        public Country: typeof CountryEnum,
        public ReleasedAt: number,
        public CreatedAt: number,
        public LastUpdateAt: number,
        public MinAgeLimit: number,
        public Duration: number | null,
        public Translations: Array<V1GetByQueryResponseTranslation>,
        public Episodes: Array<V1GetByQueryResponseEpisode>,
        public Genres: Array<V1GetByQueryResponseGenre>,
    ) {}

}

export type V1GetByQueryResponseTranslation = {
    Id: number,
    EpisodeId: number,
    ContentId: number,
    Language: typeof Language,
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
import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import { TranslationType } from "../Enums/TranslationType";
import { Country as CountryEnum } from "../Enums/Country";
import {Language} from "@/api/Enums/Language";
import {QueryContent} from "@/api/BaseQuery/QueryContent";

export type V1GetByQueryResponse = {
    Content: Array<V1GetByQueryResponseContent>
}

export class V1GetByQueryResponseContent {
    constructor(
        public Content: QueryContent,
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
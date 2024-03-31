import { TranslationType } from "../Enums/TranslationType";
import {Language} from "@/api/Enums/Language";

export type V1GetByEpisodeResponse = {
    Translators: V1GetByEpisodeResponseTranslator[],
    Episodes: V1GetByEpisodeResponseEpisode[]
}

export type V1GetByEpisodeResponseEpisode = {
    Id: number,
    Title: string,
    Number: number,
    Views: number
    Stars: number,
    Translations: V1GetByEpisodeResponseTranslation[]
}

export type V1GetByEpisodeResponseTranslation = {
    Id: number,
    EpisodeId: number,
    Lang: typeof Language,
    Link: string,
    TranslationType: typeof TranslationType,
    CreatedBy: number,
    Quality: number
}

export type V1GetByEpisodeResponseTranslator = {
    Id: number
    Name: string | null
}
import {TranslationType} from "@/api/Enums/TranslationType";

export type EpisodeListViewModel = {
    contentId: number,
    currentTranslatorId: number,
    currentEpisodeId: number,
    currentPage: number,
    episodes: EpisodeTranslationViewModel[],
    translators: TranslatorViewModel[]
    translatorName: string,
    offset: number,
    limit: number,
}

export type TranslatorViewModel = {
    title: string,
    type: typeof TranslationType,
}

export type EpisodeTranslationViewModel = {
    episodeId: number,
    number: number,
    title: string,
    releasedDate: number,
    views: number,
    stars: number,
    translationId: number,
    translationLink: string,
}

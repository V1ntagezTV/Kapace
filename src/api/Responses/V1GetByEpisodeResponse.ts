import { TranslationType } from "../Enums/TranslationType";

export class V1GetByEpisodeResponse {
    constructor(
        Translations: V1GetByEpisodeTranslation[]
    ) {
    }
}

export type V1GetByEpisodeTranslation = {
    TranslationId: number;
    EpisodeId: number;
    Language: string;
    Link: string;
    TranslationType: typeof TranslationType;
    CreatedAt: number;
    CreatedBy: number | null;
}
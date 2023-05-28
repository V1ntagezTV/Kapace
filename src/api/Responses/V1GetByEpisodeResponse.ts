import { TranslationType } from "../Enums/TranslationType";
import {Language} from "@/api/Enums/Language";

export class V1GetByEpisodeResponse {
    constructor(
        public Translations: V1GetByEpisodeTranslation[]
    ) {
    }
}

export type V1GetByEpisodeTranslation = {
    TranslationId: number;
    EpisodeId: number;
    Language: typeof Language;
    Link: string;
    TranslationType: typeof TranslationType;
    CreatedAt: number;
    CreatedBy: number | null;
    Quality: number | null;
    Translator: string | null;
    TranslatorId: number | null;
    TranslatorLink: string | null;
}
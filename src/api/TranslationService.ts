import {ApiService} from "@/api/ApiService";

export class TranslationService extends ApiService {
    constructor() {
        super("v1/translations/");
    }

    async V1GetByEpisodeAsync(request: V1GetByEpisodeRequest) : Promise<V1GetByEpisodeResponse> {
        return await this.CallHandlerAsync<V1GetByEpisodeRequest, V1GetByEpisodeResponse>(request, "get-by-episode");
    }
}

export class V1GetByEpisodeRequest {
    constructor(
        public EpisodeId: number
    ) {
    }
}

export class V1GetByEpisodeResponse {
    constructor(
        Translations: V1GetByEpisodeTranslation[]
    ) { }
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

export const TranslationType = {
    Subtitles: "Subtitles",
    AutoSubtitles: "AutoSubtitles",
    VoiceActing: "VoiceActing",
} as const;
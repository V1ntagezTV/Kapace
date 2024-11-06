import {EpisodeOrderType} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

export class V1GetByEpisodeRequest {
    constructor(
        public ContentId: number,
        public EpisodeId: number | null = null,
        public TranslatorId: number | null = null,
        public OrderBy: typeof EpisodeOrderType | null = null
    ) {
    }
}
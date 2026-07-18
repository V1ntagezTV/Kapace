import {EpisodeOrderType} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

export class V1GetByEpisodeRequest {
    constructor(
        public ContentId: string,
        public EpisodeId: string | number | null = null,
        public TranslatorId: string | number | null = null,
        public OrderBy: typeof EpisodeOrderType | null = null
    ) {
    }
}
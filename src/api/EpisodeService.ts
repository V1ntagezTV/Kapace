import {ApiService} from "@/api/ApiService";

export class EpisodeService extends ApiService {
    constructor() {
        super('v1/episode/');
    }

    public async query(request: V1EpisodeQueryRequest): Promise<V1EpisodeQueryResponse[]>  {
        return await this.CallHandlerAsync<V1EpisodeQueryResponse[], V1EpisodeQueryRequest>(request, 'query');
    }

    public async incrementViews(episodeId: number) {
        return this.CallPostHandlerAsync<{EpisodeId: number}>(
            {EpisodeId: episodeId},
            "increment-views");
    }
}

export class V1EpisodeQueryRequest {
    public EpisodeIds: number[] | undefined;
    public ContentIds: number[] | undefined;
    public Limit: number | null | undefined;
    public Offset: number | null | undefined;
}

export interface V1EpisodeQueryResponse {
    Id: number;
    ContentId: number;
    Title: string;
    Image: string;
    Number: number;
    Views: number;
    Stars: number;
    CreatedAt: number;
    CreatedBy: number;
}

import {ApiResponse, ApiService} from "@/api/ApiService";
import {FavoriteStatus} from "@/models/FavoriteStatuses";

export class FavoriteApi extends ApiService {
    constructor() {
        super('v1/favorite/');
    }

    public async query(
        contentId: string | number | null = null,
        episodeId: number | null = null,
        limit: number = 1,
        offset: number = 0)
        : Promise<ApiResponse<FavoriteQueryResponse>> {
        return await this.fetchV2<FavoriteQueryResponse, {}>(
            {
                ContentIds: contentId === null ? [] : [contentId],
                EpisodeIds: episodeId === null ? [] : [episodeId],
                Limit: limit,
                Offset: offset
            },
            'query'
        );
    }

    public async getList(
        status: FavoriteStatus,
        limit: number,
        offset: number)
        : Promise<ApiResponse<FavoriteGetListResponse>> {
        return await this.fetchV2<FavoriteGetListResponse, {}>(
            {
                Status: status,
                Limit: limit,
                Offset: offset
            },
            'get-list'
        );
    }

    public async setStatus(contentId: string | number, status: FavoriteStatus | null) {
        return await this.fetchV2<{}, {}>(
            {
                ContentId: contentId,
                Status: status
            },
            'set-status'
        );
    }

    public async setStars(contentId: string | number, stars: number) {
        return await this.fetchV2<{}, {}>(
            {
                ContentId: contentId,
                Stars: stars
            },
            'set-stars'
        );
    }

    public async setEpisode(contentId: string | number, episodeId: number) {
        return await this.fetchV2<{}, {}>(
            {
                ContentId: contentId,
                EpisodeId: episodeId
            },
            'set-episode'
        );
    }
}

export type FavoriteQueryResponse = {
    Favorites : Favorite[]
}

export type Favorite = {
    Id: number,
    UserId: number,
    ContentId: number,
    EpisodeId: number | null,
    Status: FavoriteStatus | null,
    Stars: number | null,
    CreatedAt: number
}

export type FavoriteGetListResponse = {
    Favorites : FavoriteGetList[]
}

export type FavoriteGetList = {
    Id: number,
    UserId: number,
    ContentId: number,
    Title: string,
    EpisodeId: number | null,
    Status: FavoriteStatus | null,
    Stars: number | null,
    CreatedAt: number
}



import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";
import {ApiResponse, ApiService} from "@/api/ApiService";
import {MainPageType} from "@/api/Enums/MainPageType";
import {V1GetMainPageContentRequest} from "@/api/Requests/V1GetMainPageContentRequest";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {V1GetFullContentRequest} from "@/api/Requests/V1GetFullContentRequest";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {V1GetByQueryRequest} from "@/api/Requests/V1GetByQueryRequest";
import {V1GetByQueryResponse} from "@/api/Requests/V1GetByQueryResponse";



export class ContentService extends ApiService {
    constructor() { super("v1/content/"); }

    async V1GetMainPageContentAsync(): Promise<ApiResponse<V1GetMainPageContentResponse>> {
        const request = {
            mainPageTypes: [MainPageType.LastCreated, MainPageType.PopularForTwoWeeks, MainPageType.LastUpdated],
            limit: 20,
            offset: 0,
        };

        return this.fetchV2<V1GetMainPageContentResponse, {}>(
            request,
            "get-main-page-content"
        );
    }

    async V1GetById(contentId: bigint | string): Promise<V1GetFullContentResponse> {
        const request = new V1GetFullContentRequest(
            typeof contentId === "string" ? BigInt(contentId) : contentId,
            ContentSelectedInfo.ContentGenres |
            ContentSelectedInfo.UserInfo |
            ContentSelectedInfo.Episodes |
            ContentSelectedInfo.StarsAggregates
        );

        const response = await this.fetchV2<V1GetFullContentResponse, V1GetFullContentRequest>(request, "get-by-id");
        if (!response.data) {
            throw new Error("Failed to load content by id");
        }

        return response.data;
    }

    async V1GetByQuery(request: V1GetByQueryRequest) : Promise<V1GetByQueryResponse> {
        return this.CallHandlerAsync<V1GetByQueryResponse, V1GetByQueryRequest>(request, "get-by-query")
    }

    async searchBy(searchInput: string) {
        return this.CallHandlerAsync<V1SearchByResponse, V1SearchByRequest>({Search: searchInput} as V1SearchByRequest, "search-by")
    }

    async incrementViews(contentId: string | number) {
        return this.CallPostHandlerAsync<{ContentId: string | number}>(
            {ContentId: contentId},
            "increment-views");
    }
}

interface V1SearchByRequest {
    Search: string
}

interface V1SearchByResponse {
    Units: V1SearchByResponseUnit[]
}

export interface V1SearchByResponseUnit {
    ContentId: number;
    Title: string;
    AvatarImageLink: string;
    Images: string[];
}


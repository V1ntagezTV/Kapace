import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";
import {ApiService} from "@/api/ApiService";
import {MainPageType} from "@/api/Enums/MainPageType";
import {V1GetMainPageContentRequest} from "@/api/Requests/V1GetMainPageContentRequest";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {V1GetFullContentRequest} from "@/api/Requests/V1GetFullContentRequest";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {V1GetByQueryRequest} from "@/api/Requests/V1GetByQueryRequest";
import {V1GetByQueryResponse} from "@/api/Requests/V1GetByQueryResponse";



export class ContentService extends ApiService {
    constructor() { super("v1/content/"); }

    async V1GetMainPageContentAsync(): Promise<V1GetMainPageContentResponse> {
        const request = new V1GetMainPageContentRequest(
            [MainPageType.LastCreated, MainPageType.PopularForTwoWeeks, MainPageType.LastUpdated],
            20,
            0);

        return this.CallHandlerAsync<V1GetMainPageContentResponse, V1GetMainPageContentRequest>(
            request,
            "get-main-page-content"
        );
    }

    async V1GetById(contentId: number, userId: number): Promise<V1GetFullContentResponse> {
        const request = new V1GetFullContentRequest(
            contentId,
            ContentSelectedInfo.ContentGenres | ContentSelectedInfo.UserInfo | ContentSelectedInfo.Episodes,
            userId
        );

        return this.CallHandlerAsync<V1GetFullContentResponse, V1GetFullContentRequest>(request, "get-by-id");
    }

    async V1GetByQuery(request: V1GetByQueryRequest) : Promise<V1GetByQueryResponse> {
        return this.CallHandlerAsync<V1GetByQueryResponse, V1GetByQueryRequest>(request, "get-by-query")
    }

    async searchBy(searchInput: string) {
        return this.CallHandlerAsync<V1SearchByResponse, V1SearchByRequest>({Search: searchInput} as V1SearchByRequest, "search-by")
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
    ImageId: number;
}


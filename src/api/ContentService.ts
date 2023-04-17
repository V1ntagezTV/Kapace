import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";
import {ApiService} from "@/api/ApiService";
import {V1GetNewsResponse} from "@/api/Responses/V1GetNewsResponse";
import {MainPageType} from "@/api/Enums/MainPageType";
import {V1GetMainPageContentRequest} from "@/api/Requests/V1GetMainPageContentRequest";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {V1GetFullContentRequest} from "@/api/Requests/V1GetFullContentRequest";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";

export class ContentService extends ApiService {
    constructor() {
        super("v1/content/");
    }

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

    async V1GetNewsAsync() : Promise<V1GetNewsResponse> {
        return new V1GetNewsResponse([]);
    }

    async V1GetFullContentAsync(contentId: number, userId: number): Promise<V1GetFullContentResponse> {
        const request = new V1GetFullContentRequest(
            contentId,
            ContentSelectedInfo.ContentGenres | ContentSelectedInfo.UserInfo | ContentSelectedInfo.Episodes,
            userId
        );

        return this.CallHandlerAsync<V1GetFullContentResponse, V1GetFullContentRequest>(
            request,
            "get-by-id"
        );
    }
}


import {
    V1GetMainPageContentResponse
} from "@/api/Responses/V1GetMainPageContentResponse";
import {ApiController} from "@/api/ApiController";
import {V1GetNewsResponse} from "@/api/Responses/V1GetNewsResponse";
import {MainPageType} from "@/api/Enums/MainPageType";
import {V1GetMainPageContentRequest} from "@/api/Requests/V1GetMainPageContentRequest";

class V1GetFullContentAsync {
}

export class ContentController extends ApiController {
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

    async V1GetFullContentAsync(): Promise<V1GetFullContentAsync> {
        return new V1GetFullContentAsync();
    }
}

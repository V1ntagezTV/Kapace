import {ApiService} from "@/api/ApiService";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {V1GetByEpisodeResponse} from "@/api/Responses/V1GetByEpisodeResponse";

export class TranslationService extends ApiService {
    constructor() {
        super("v1/translations/");
    }

    async V1GetByEpisodeAsync(request: V1GetByEpisodeRequest) : Promise<V1GetByEpisodeResponse> {
        return await this.CallHandlerAsync<V1GetByEpisodeResponse, V1GetByEpisodeRequest>(request, "get-by-episode");
    }
}
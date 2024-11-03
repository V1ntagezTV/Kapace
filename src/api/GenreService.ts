import {ApiService} from "@/api/ApiService";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {V1GetByEpisodeResponse} from "@/api/Responses/V1GetByEpisodeResponse";
import {GenreQueryRequest} from "@/api/Requests/GenreQueryRequest";
import {GenreQueryResponse} from "@/api/Responses/GenreQueryResponse";

export class GenreService extends ApiService {
    constructor() {
        super("v1/genre/");
    }

    async Query(request: GenreQueryRequest) : Promise<GenreQueryResponse> {
        return await this.CallHandlerAsync<GenreQueryResponse, GenreQueryRequest>(request, "query");
    }
}


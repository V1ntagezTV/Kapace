import {ApiResponse, ApiService} from "@/api/ApiService";
import {V1CreateContentResponse} from "@/api/Responses/V1CreateContentResponse";
import {V1CreateContentRequest} from "@/api/Requests/V1CreateContentRequest";
import {V1GetChangesComparisonsRequest} from "@/api/Requests/V1GetChangesComparisonsRequest";
import {V1GetChangesComparisonsResponse} from "@/api/Responses/V1GetChangesComparisonsResponse";
import { Language } from "./Enums/Language";
import {TranslationType} from "@/api/Enums/TranslationType";

export type V1CreateEpisodeChangeRequest = {
    ContentId: number,
    ChangeableFields: ChangeableEpisodeFields,
    CreatedBy: number
}

export type ChangeableEpisodeFields = {
    Number: number,
    VideoScript: string,
    Language: typeof Language,
    TranslationType: typeof TranslationType,
    EpisodeId: number | null,
    TranslatorId: number | null,
    Quality: number | null,
}

type V1ApproveRequest = {
    HistoryId: number,
    UserId: number
}

export class ChangesHistoryService extends ApiService {
    constructor() { super("v1/changes/"); }

    public async createContentChange(request: V1CreateContentRequest): Promise<V1CreateContentResponse>  {
        return await this.CallHandlerAsync<V1CreateContentResponse, V1CreateContentRequest>(
            request,
            'create-content'
        );
    }

    public async createEpisodeChange(request: V1CreateEpisodeChangeRequest) {
        return await this.CallPostHandlerAsync<V1CreateEpisodeChangeRequest>(request, 'create-episode')
    }

    public async getChangesComparisons(request: V1GetChangesComparisonsRequest)
        : Promise<ApiResponse<V1GetChangesComparisonsResponse>> {
        return await this.fetchV2<V1GetChangesComparisonsResponse, V1GetChangesComparisonsRequest>(
            request,
            "get-changes-comparisons"
        );
    }

    public async approve(request: V1ApproveRequest) : Promise<Response> {
        return await this.CallPostHandlerAsync(request, 'approve');
    }
}
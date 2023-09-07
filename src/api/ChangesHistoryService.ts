import {ApiService} from "@/api/ApiService";
import {V1CreateContentResponse} from "@/api/Responses/V1CreateContentResponse";
import {V1CreateContentRequest} from "@/api/Requests/V1CreateContentRequest";

export class ChangesHistoryService extends ApiService {
    constructor() { super("v1/changes/"); }

    public async createContentChange(request: V1CreateContentRequest): Promise<V1CreateContentResponse>  {
        return await this.CallHandlerAsync<V1CreateContentResponse, V1CreateContentRequest>(
            request,
            'create-content'
        );
    }
}
import {ApiService} from "./ApiService";

export class TranslatorService extends ApiService {
    constructor() {
        super('v1/translator/');
    }

    public async query(request: V1TranslatorQueryRequest) {
        return await this.CallHandlerAsync<V1TranslatorQueryResponse, V1TranslatorQueryRequest>(request, 'query');
    }
}

export type V1TranslatorQueryRequest = {
    TranslatorIds: number[] | null
    Search: string | null,
    Offset: number | null,
    Limit: number | null
}

export type V1TranslatorQueryResponse = {
    Translators: V1TranslatorQueryResponseUnit[]
}

export type V1TranslatorQueryResponseUnit = {
    TranslatorId: number,
    Name: string,
    Link: string
}


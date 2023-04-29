import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {ContentType} from "@/api/Enums/ContentType";
import {Country} from "@/api/Enums/Country";
import {QueryPaging} from "@/api/Models/QueryPaging";
import {TranslationType} from "../Enums/TranslationType";
import {V1GetByQueryResponse} from "@/api/Requests/V1GetByQueryResponse";

export type V1GetByQueryRequest = {
    Search: string;
    Filters: V1GetByQuerySearchFilters;
    QueryPaging: QueryPaging;
    SelectedInfo: ContentSelectedInfo;
}

export type V1GetByQuerySearchFilters = {
    Countries: Array<typeof Country>,
    ContentTypes: Array<ContentType>,
    ContentStatuses: Array<ContentStatus>,
    GenreIds: Array<number>,
}
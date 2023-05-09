import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {ContentType} from "@/api/Enums/ContentType";
import {Country} from "@/api/Enums/Country";
import {QueryPaging} from "@/api/Models/QueryPaging";

export class V1GetByQueryRequest {
    public Search: string = "";
    public Filters: V1GetByQuerySearchFilters = new V1GetByQuerySearchFilters();
    public QueryPaging: QueryPaging = { Limit: 20, Offset: 0 };
    public SelectedInfo: ContentSelectedInfo = ContentSelectedInfo.None;
}

export class V1GetByQuerySearchFilters {
    public Countries: Array<typeof Country> = [];
    public ContentTypes: Array<typeof ContentType> = [];
    public ContentStatuses: Array<typeof ContentStatus> = [];
    public GenreIds: Array<number> = [];
}
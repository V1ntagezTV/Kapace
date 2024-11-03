import {MainPageType} from "@/api/Enums/MainPageType";
import {QueryContent} from "@/api/BaseQuery/QueryContent";

export class V1GetMainPageContentPair {
    constructor(
        public MainPageType: MainPageType,
        public ContentsInfo: V1GetMainPageContentContent[]
    ) {
    }
}

export interface V1GetMainPageContentContent {
    Content: QueryContent,
    Genres: string[]
}

export class V1GetMainPageContentResponse {
    constructor(public PageContent: V1GetMainPageContentPair[]) { }
}
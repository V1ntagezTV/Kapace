import {MainPageType} from "@/api/Enums/MainPageType";

export class V1GetMainPageContentRequest {
    constructor(
        public mainPageTypes: MainPageType[],
        public limit: number,
        public offset: number,
    ) {
    }
}
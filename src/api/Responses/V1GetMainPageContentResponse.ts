import {MainPageType} from "@/api/Enums/MainPageType";

export class V1GetMainPageContent {
    constructor(
        public id: number,
        public title: string,
        public views: number,
        public ranked: number,
        public seriesOut: number,
        public seriesPlanned: number,
    ) {
    }
}

export class V1GetMainPageContentResponse {
    constructor(content: Map<MainPageType, V1GetMainPageContent>) {
    }
}


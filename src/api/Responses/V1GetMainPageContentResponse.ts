import {MainPageType} from "@/api/Enums/MainPageType";

export class V1GetMainPageContent {
    constructor(
        public Id: number,
        public Image: string,
        public Title: string,
        public Views: number,
        public ImportStars: number,
        public SeriesOut: number,
        public SeriesPlanned: number,
    ) {
    }
}

export class V1GetMainPagePair {
    constructor(
        public MainPageType: MainPageType,
        public Content: V1GetMainPageContent[],
    ) {
    }
}

export class V1GetMainPageContentResponse {
    constructor(public Contents: V1GetMainPagePair[]) {
    }
}
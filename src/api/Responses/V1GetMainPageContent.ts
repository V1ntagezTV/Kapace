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
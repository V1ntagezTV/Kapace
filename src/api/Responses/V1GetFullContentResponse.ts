import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";

export class V1GetFullContentResponse {
    constructor(
        public contentId: bigint,
        public title: string,
        public description: string,
        public contentType: ContentType,
        public contentStatus: ContentStatus,
        public image: string,
        public importStars: number,
        public outSeries: number,
        public plannedSeries: number,
        public views: number,
        public country: number,
        public releasedAt: Number,
        public createdAt: Number,
        public lastUpdateAt: Number,
        public minAgeLimit: Number,
        public duration: Number | null,
        public episodes: V1GetFullContentEpisode[],
        public genres: V1GetFullContentGenre[],
        public userInfo: V1GetFullContentUserInfo | null) {
    }
}

export class V1GetFullContentGenre {
    constructor(
        public genreId: number,
        public name: string) {
    }
}

export class V1GetFullContentEpisode {
    constructor(
        public id: number,
        public title: string,
        public image: string,
        public number: number
    ) { }
}


export class V1GetFullContentUserInfo {
    constructor(
        public contentId: number,
        public userId: number,
        public isInFavourite: boolean,
        public lastViewedSeries: number,
        public rating: number
    ) {
    }
}

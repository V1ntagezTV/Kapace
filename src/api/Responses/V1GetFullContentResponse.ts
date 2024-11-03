import {QueryContent} from "@/api/BaseQuery/QueryContent";

export class V1GetFullContentResponse {
    constructor(
        public Content: QueryContent,
        public Episodes: V1GetFullContentEpisode[],
        public Genres: V1GetFullContentGenre[],
        public UserInfo: V1GetFullContentUserInfo | null) {
    }
}

export class V1GetFullContentGenre {
    constructor(
        public GenreId: number,
        public Name: string) {
    }
}

export class V1GetFullContentEpisode {
    constructor(
        public Id: number,
        public Title: string,
        public Image: string,
        public Number: number,
    ) { }
}


export class V1GetFullContentUserInfo {
    constructor(
        public ContentId: number,
        public UserId: number,
        public IsInFavourite: boolean,
        public LastViewedSeries: number,
        public Rating: number
    ) {
    }
}

import {ContentType as Type} from "@/api/Enums/ContentType";
import {ContentStatus as Status} from "@/api/Enums/ContentStatus";

export class V1GetFullContentResponse {
    constructor(
        public ContentId: bigint,
        public Title: string,
        public Description: string,
        public ContentType: typeof Type,
        public ContentStatus: typeof Status,
        public Image: string,
        public ImportStars: number,
        public OutSeries: number,
        public PlannedSeries: number,
        public Views: number,
        public Country: string,
        public ReleasedAt: Number,
        public CreatedAt: Number,
        public LastUpdateAt: Number,
        public MinAgeLimit: Number,
        public Duration: Number | null,
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
        public Number: number
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

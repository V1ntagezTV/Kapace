import {Genre} from "@/components/Theater/ViewModels/Genre";
import {Tag} from "@/components/Theater/ViewModels/Tag";
import {TheaterContentTypes} from "@/models/TheaterContentTypes";
import {TheaterContentStatus} from "@/models/TheaterContentStatus";

/**
 * Theater view model.
 */
export class TheaterContent {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public stars: number,
        public createdAt: number,
        public releasedAt: number,
        public image: string,
        public type: TheaterContentTypes,
        public status: TheaterContentStatus,
        public country: string,
        public minAgeLimit: number,
        public genres: Genre[],
        public tags: Tag[],
        public contentInfoToUser: TheaterInfoToUser,
        public videos: VideoUnit[],
    ) {
    }
}

/**
 * Current authorized user information model about theater content.
 */
export class TheaterInfoToUser {
    constructor(
        public isInFavourite: boolean,
        public inGroup: string | null = null,
        public rating: number | null = null,
        public continueToWatchFrom: number | null = null,
    ) {
    }
}

export class VideoUnit {
    constructor(
        public id: number,
        public name: string,
        public series: number,
    ) {
    }
}
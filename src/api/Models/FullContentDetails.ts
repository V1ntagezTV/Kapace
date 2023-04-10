import {Genre} from "@/api/Models/Genre";
import {Tag} from "@/api/Models/Tag";
import {TheaterContentTypes} from "@/models/TheaterContentTypes";
import {TheaterContentStatus} from "@/models/TheaterContentStatus";

export class FullContentDetails {
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
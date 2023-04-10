import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";

export class V1GetFullContentRequest {
    constructor(
        public contentId: number,
        public selectedInfo: ContentSelectedInfo,
        public userId: number
    ) {
    }
}
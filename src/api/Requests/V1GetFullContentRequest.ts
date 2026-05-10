import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";

export class V1GetFullContentRequest {
    constructor(
        public contentId: bigint,
        public selectedInfo: ContentSelectedInfo,
    ) {
    }
}
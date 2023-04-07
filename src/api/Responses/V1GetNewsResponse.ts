import {News} from "@/api/Models/News";

export class V1GetNewsResponse {
    constructor(public news: News[]) {
    }
}
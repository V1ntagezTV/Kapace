import {ApiService} from "@/api/ApiService";

export class ImageService extends ApiService {
    constructor() { super("image"); }

    public async insertImage(contentId: bigint, image: File): Promise<InsertImageResponse> {
        const formData = new FormData();
        formData.append("Image", image);
        formData.append("ContentId", contentId.toString());

        const path = `${this.hostPath}${this.servicePath}/content/insert`;
        const response = await fetch(path, {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        return await response.json() as InsertImageResponse;
    }
}

type InsertImageResponse = {
    ImageName: string,
    ImageLink: string,
}
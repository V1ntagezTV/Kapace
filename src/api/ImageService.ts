import {ApiService} from "@/api/ApiService";
import {Linter} from "eslint";
import FlatConfigFileSpec = Linter.FlatConfigFileSpec;

export class ImageService extends ApiService {
    constructor() { super("image"); }

    public async insertImage(
        contentId: number | null,
        historyId: number,
        image: FlatConfigFileSpec | FlatConfigFileSpec[]): Promise<any> {
        const formData = new FormData();

        // @ts-ignore
        formData.append("Image", image);
        if (contentId != null) formData.append("ContentId", contentId.toString());
        formData.append("HistoryId", historyId.toString());

        await this.CallHandlerByFormDataAsync(
            "/content/insert",
            formData,
        );
    }

    public getImageLink(imageId: number, contentId: number): string {
        return `http://localhost:5000/image/content/get-avatar?ImageId=${imageId}&ContentId=${contentId}`;
    }
}
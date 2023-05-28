export class StringExtensions {
    static isNullOrEmpty(imageUrl: string) : boolean {
        return !imageUrl || imageUrl.length === 0;
    }
}
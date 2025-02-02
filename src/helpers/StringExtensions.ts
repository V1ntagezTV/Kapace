export class StringExtensions {
    static isNullOrEmpty(value: string) : boolean {
        return !value || value.trim().length === 0;
    }
}
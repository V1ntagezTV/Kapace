export const ContentStatus = {
    Announced: "Announced",
    Ongoing: "Ongoing",
    Stopped: "Stopped",
    Finished: "Finished",
    Released: "Released"
} as const;

const ContentStatusRu = {
    Announced: "Анонсировано",
    Ongoing: "Онгоинг",
    Stopped: "Приостановлено",
    Finished: "Завершено",
    Released: "Выпущено"
} as const;

export function mapContentStatusToRuStr(contentType: keyof typeof ContentStatus | undefined): string {
    if (!contentType) {
        return "";
    }

    return ContentStatusRu[contentType];
}
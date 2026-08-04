export const HistoryType = {
    Content: "Content",
    Episode: "Episode",
    Person: "Person",
} as const;

export const HistoryChangesOrderType = {
    Unspecified: "Unspecified",
    ById: "ById",
    ByName: "ByName",
    ByCreated: "ByCreated",
    ByCreatedDescending: "ByCreatedDescending"
} as const;

export type HistoryTypeValue = (typeof HistoryType)[keyof typeof HistoryType];
export type HistoryChangesOrderTypeValue = (typeof HistoryChangesOrderType)[keyof typeof HistoryChangesOrderType];
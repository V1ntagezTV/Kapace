export const HistoryType = {
    Content: "Content",
    Episode: "Episode",
} as const;

export const HistoryChangesOrderType = {
    Unspecified: "Unspecified",
    ById: "ById",
    ByName: "ByName",
    ByCreated: "ByCreated",
    ByCreatedDescending: "ByCreatedDescending"
} as const;
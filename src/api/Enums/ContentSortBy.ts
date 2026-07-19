export const ContentSortBy = {
    Views: "Views",
    Rating: "Rating",
    ReleasedAt: "ReleasedAt",
    LastUpdateAt: "LastUpdateAt",
    CreatedAt: "CreatedAt",
} as const;

export type ContentSortBy = typeof ContentSortBy[keyof typeof ContentSortBy];

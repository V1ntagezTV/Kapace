export const SortDirection = {
    Asc: "Asc",
    Desc: "Desc",
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];

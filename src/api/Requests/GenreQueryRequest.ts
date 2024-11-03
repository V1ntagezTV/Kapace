export type GenreQueryRequest = {
    Search: string | null,
    GenreIds: number[] | null,
    Names: string[] | null,
    Limit: number | null,
    Offset: number | null
}
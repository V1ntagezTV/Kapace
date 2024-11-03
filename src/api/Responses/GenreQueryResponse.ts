export type GenreQueryResponse = {
    Genres: GenreQueryResponseGenre[] | null
}

export type GenreQueryResponseGenre = {
    Id: number,
    Name: string,
    CreatedAt: number,
    CreatedBy: number
}
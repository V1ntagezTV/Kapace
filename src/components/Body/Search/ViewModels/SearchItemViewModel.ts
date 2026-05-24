export type SearchItemViewModel = {
    Id: number
    AvatarImageLink: string
    Images: string[]
    Title: string
    Description: string
    Translates: string[]
    Genres: string | null
    MinAge: number | null
    SeriesCounter: string | null
    IsInFavorites?: boolean
}
import {QueryContent} from "@/api/BaseQuery/QueryContent";
import {FavoriteStatus} from "@/models/FavoriteStatuses";
import {PersonRoleValue} from "@/api/Enums/PersonRole";

export class V1GetFullContentResponse {
    constructor(
        public Content: QueryContent,
        public Episodes: V1GetFullContentEpisode[],
        public Genres: V1GetFullContentGenre[],
        public Persons: V1GetFullContentPerson[],
        public UserInfo: V1GetFullUserFavouriteInfo | null,
        public StarsAggregates: StarsAggregate) {
    }
}

export type V1GetFullContentPersonRole = {
    Role: PersonRoleValue,
    CharacterName: string | null,
}

export type V1GetFullContentPerson = {
    PersonId: number,
    Name: string,
    ImageLink: string | null,
    Roles: V1GetFullContentPersonRole[],
}

export class V1GetFullContentGenre {
    constructor(
        public GenreId: number,
        public Name: string) {
    }
}

export class V1GetFullContentEpisode {
    constructor(
        public Id: number,
        public Title: string,
        public Image: string,
        public Number: number,
    ) { }
}


export type V1GetFullUserFavouriteInfo = {
    FavouriteStatus: typeof FavoriteStatus | null,
    EpisodeId: number | null,
    Stars: number
}

export type StarsAggregate = {
    One: number,
    Two: number,
    Three: number,
    Four: number,
    Five: number,
    Stars: number
}

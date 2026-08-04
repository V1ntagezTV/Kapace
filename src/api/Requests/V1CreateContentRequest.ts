import {ContentType} from "../Enums/ContentType"
import {Country} from "../Enums/Country"
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {PersonRoleValue} from "@/api/Enums/PersonRole";

export type V1CreateContentRequest = {
    readonly GeneratedId: bigint,
    readonly ContentId: bigint | null,
    readonly ChangeableFields: V1ChangeableFields,
    readonly CreatedBy: number
}

export type V1ContentPersonRole = {
    Role: PersonRoleValue;
    CharacterName: string | null;
};

export type V1ContentPerson = {
    PersonId: number;
    Roles: V1ContentPersonRole[];
};

export type V1ChangeableFields = {
    Title: string | null,
    EngTitle: string | null,
    OriginalTitle: string | null,
    Description: string | null,
    Country: typeof Country | null,
    ContentType: typeof ContentType | null,
    ContentStatus: typeof ContentStatus | null,
    AvatarImageName: string | null,
    AdditionalImageNames: string[] | null,
    Genres: string[] | null,
    Persons: V1ContentPerson[] | null,
    Duration: number | null,
    ReleasedAt: string | null,
    PlannedSeries: number | null,
    MinAge: number | null,
    Channel: string | null
}

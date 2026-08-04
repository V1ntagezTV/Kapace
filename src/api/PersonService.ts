import { ApiService } from './ApiService';
import { ContentStatus } from '@/api/Enums/ContentStatus';
import { ContentType } from '@/api/Enums/ContentType';
import { PersonGenderValue } from '@/api/Enums/PersonGender';
import { PersonRoleValue } from '@/api/Enums/PersonRole';

export class PersonService extends ApiService {
    constructor() {
        super('v1/person/');
    }

    public async query(request: V1PersonQueryRequest) {
        return await this.CallHandlerAsync<V1PersonQueryResponse, V1PersonQueryRequest>(request, 'query');
    }

    public async getById(personId: number | string) {
        return await this.CallHandlerAsync<V1GetPersonByIdResponse, V1GetPersonByIdRequest>(
            { PersonId: Number(personId) },
            'get-by-id'
        );
    }
}

export type V1PersonQueryRequest = {
    PersonIds: number[] | null;
    Search: string | null;
    Offset: number | null;
    Limit: number | null;
};

export type V1PersonQueryResponse = {
    Persons: V1PersonQueryResponseUnit[];
};

export type V1PersonQueryResponseUnit = {
    PersonId: number;
    Name: string;
    ImageLink: string | null;
};

export type V1GetPersonByIdRequest = {
    PersonId: number;
};

export type V1GetPersonByIdResponse = {
    Person: V1PersonInfo;
    Contents: V1PersonContentAppearance[];
};

export type V1PersonInfo = {
    PersonId: number;
    Name: string;
    Description: string;
    ImageLink: string | null;
    AdditionalImages: V1PersonAdditionalImage[];
    Gender: PersonGenderValue;
    BirthDate: string | null;
    CreatedAt: number;
};

export type V1PersonAdditionalImage = {
    ImageName: string;
    ImageLink: string;
};

export type V1PersonContentRole = {
    Role: PersonRoleValue;
    CharacterName: string | null;
};

export type V1PersonContentAppearance = {
    ContentId: number;
    Title: string;
    AvatarImageLink: string | null;
    Roles: V1PersonContentRole[];
    Type: keyof typeof ContentType;
    Status: keyof typeof ContentStatus | null;
    OutSeries: number;
    PlannedSeries: number;
};

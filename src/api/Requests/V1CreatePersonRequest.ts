import { PersonGenderValue } from '@/api/Enums/PersonGender';

export type V1PersonChangeableFields = {
    ImageName: string | null;
    AdditionalImageNames: string[] | null;
    Name: string | null;
    Description: string | null;
    Gender: PersonGenderValue | null;
    BirthDate: string | null;
};

export type V1CreatePersonRequest = {
    GeneratedId: bigint;
    PersonId: bigint | null;
    ChangeableFields: V1PersonChangeableFields;
    CreatedBy: number;
};

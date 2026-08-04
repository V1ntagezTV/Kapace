export const PersonGender = {
    Unspecified: 'Unspecified',
    Male: 'Male',
    Female: 'Female',
} as const;

export type PersonGenderValue = (typeof PersonGender)[keyof typeof PersonGender];

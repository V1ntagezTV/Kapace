export const PersonRole = {
    Actor: 'Actor',
    Director: 'Director',
    Writer: 'Writer',
    Producer: 'Producer',
} as const;

export type PersonRoleValue = (typeof PersonRole)[keyof typeof PersonRole];

export const PERSON_ROLE_LABELS: Record<PersonRoleValue, string> = {
    Actor: 'Актёр',
    Director: 'Режиссёр',
    Writer: 'Сценарист',
    Producer: 'Продюсер',
};

export const PERSON_ROLE_OPTIONS = Object.values(PersonRole);

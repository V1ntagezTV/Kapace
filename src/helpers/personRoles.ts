import { PersonRole, type PersonRoleValue } from '@/api/Enums/PersonRole';

export type PersonRoleLike = {
    Role: PersonRoleValue | string;
    CharacterName?: string | null;
};

export function getActorCharacterName(roles: PersonRoleLike[] | null | undefined): string | null {
    if (!roles?.length) {
        return null;
    }

    const actorRole = roles.find(role => role.Role === PersonRole.Actor);
    const characterName = actorRole?.CharacterName?.trim();
    return characterName ? characterName : null;
}

export function formatPersonRolesLabel(
    roles: PersonRoleValue[],
    characterName?: string | null
): string {
    const roleLabels = roles.join(', ');
    const trimmedCharacterName = characterName?.trim();
    if (roles.includes(PersonRole.Actor) && trimmedCharacterName) {
        return `${roleLabels} (${trimmedCharacterName})`;
    }
    return roleLabels;
}

import { PersonService, V1PersonQueryResponseUnit } from '@/api/PersonService';
import { PersonRole, PERSON_ROLE_LABELS, PERSON_ROLE_OPTIONS, type PersonRoleValue } from '@/api/Enums/PersonRole';
import { formatPersonRolesLabel } from '@/helpers/personRoles';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { computed, inject, ref, type Ref } from 'vue';

const MAX_CHARACTER_NAME_LENGTH = 128;

export type ContentPersonEntry = {
    PersonId: number;
    PersonName: string;
    ImageLink: string | null;
    Roles: PersonRoleValue[];
    CharacterName: string;
};

export function useContentPersonPicker(contentPersons: Ref<ContentPersonEntry[]>) {
    const injectedPersonService = inject<PersonService>('person-service');
    if (!injectedPersonService) {
        throw new Error('Edits: провайдер person-service не найден');
    }

    const personService = injectedPersonService;
    const clientEventStore = ClientEventStore();

    const personsList = ref<V1PersonQueryResponseUnit[]>([]);
    const personSelectableValues = ref<string[]>([]);
    const personInput = ref('');
    const personSelectedTitle = ref('');
    const isPersonsMenuDropped = ref(false);
    const characterNameInput = ref('');
    const isCharacterNameInvalid = ref(false);
    const selectedRoles = ref<PersonRoleValue[]>([]);
    const isRolesInvalid = ref(false);

    const roleSelectableValues = PERSON_ROLE_OPTIONS.map(role => PERSON_ROLE_LABELS[role]);
    const hasActorRole = computed(() => selectedRoles.value.includes(PersonRole.Actor));

    function roleFromLabel(label: string): PersonRoleValue | null {
        const entry = Object.entries(PERSON_ROLE_LABELS).find(([, value]) => value === label);
        return (entry?.[0] as PersonRoleValue | undefined) ?? null;
    }

    function clearPersonSearchFields() {
        personInput.value = '';
        personSelectedTitle.value = '';
        personSelectableValues.value = [];
        personsList.value = [];
        isPersonsMenuDropped.value = false;
    }

    function resetPersonPicker() {
        contentPersons.value = [];
        characterNameInput.value = '';
        isCharacterNameInvalid.value = false;
        selectedRoles.value = [];
        isRolesInvalid.value = false;
        clearPersonSearchFields();
    }

    async function onChangePersonInput(newInput: string, isSelected: boolean) {
        personInput.value = newInput;
        personSelectedTitle.value = isSelected ? newInput : '';

        if (newInput.length === 0) {
            clearPersonSearchFields();
            return;
        }

        const personsResponse = await personService.query({
            Limit: 7,
            Offset: null,
            Search: newInput,
            PersonIds: null,
        });

        personSelectableValues.value = personsResponse.Persons.map(person => person.Name);
        personsList.value = personsResponse.Persons;

        if (personSelectableValues.value.length > 0) {
            isPersonsMenuDropped.value = true;
        }
    }

    function toggleRoleByLabel(label: string) {
        const role = roleFromLabel(label);
        if (!role) {
            return;
        }

        if (selectedRoles.value.includes(role)) {
            selectedRoles.value = selectedRoles.value.filter(item => item !== role);
            if (role === PersonRole.Actor) {
                characterNameInput.value = '';
                isCharacterNameInvalid.value = false;
            }
        } else {
            selectedRoles.value = [...selectedRoles.value, role];
        }

        isRolesInvalid.value = false;
    }

    function removeSelectedRole(role: PersonRoleValue) {
        selectedRoles.value = selectedRoles.value.filter(item => item !== role);
        if (role === PersonRole.Actor) {
            characterNameInput.value = '';
            isCharacterNameInvalid.value = false;
        }
    }

    function addSelectedPerson() {
        isRolesInvalid.value = selectedRoles.value.length === 0;
        if (isRolesInvalid.value) {
            clientEventStore.push('Ошибка! Выберите хотя бы одну роль.', EventTypes.Error);
            return;
        }

        const trimmedCharacterName = characterNameInput.value.trim();
        if (hasActorRole.value) {
            isCharacterNameInvalid.value = trimmedCharacterName.length === 0
                || trimmedCharacterName.length > MAX_CHARACTER_NAME_LENGTH;

            if (isCharacterNameInvalid.value) {
                clientEventStore.push('Ошибка! Укажите имя персонажа (до 128 символов).', EventTypes.Error);
                return;
            }
        } else {
            isCharacterNameInvalid.value = false;
        }

        if (!personSelectedTitle.value) {
            clientEventStore.push('Ошибка! Выберите персону из списка.', EventTypes.Error);
            return;
        }

        const selectedPerson = personsList.value.find(person => person.Name === personSelectedTitle.value);
        if (!selectedPerson) {
            clientEventStore.push('Ошибка! Выберите персону из списка.', EventTypes.Error);
            return;
        }

        if (contentPersons.value.some(person => person.PersonId === selectedPerson.PersonId)) {
            clientEventStore.push('Ошибка! Эта персона уже добавлена.', EventTypes.Error);
            return;
        }

        contentPersons.value.push({
            PersonId: selectedPerson.PersonId,
            PersonName: selectedPerson.Name,
            ImageLink: selectedPerson.ImageLink,
            Roles: [...selectedRoles.value],
            CharacterName: hasActorRole.value ? trimmedCharacterName : '',
        });

        characterNameInput.value = '';
        isCharacterNameInvalid.value = false;
        selectedRoles.value = [];
        isRolesInvalid.value = false;
        clearPersonSearchFields();
    }

    function removeContentPerson(personId: number) {
        contentPersons.value = contentPersons.value.filter(person => person.PersonId !== personId);
    }

    function formatContentPersonChip(person: ContentPersonEntry): string {
        return `${person.PersonName} — ${formatPersonRolesLabel(person.Roles, person.CharacterName)}`;
    }

    return {
        personsList,
        personSelectableValues,
        personInput,
        personSelectedTitle,
        isPersonsMenuDropped,
        characterNameInput,
        isCharacterNameInvalid,
        selectedRoles,
        isRolesInvalid,
        roleSelectableValues,
        hasActorRole,
        contentPersons,
        onChangePersonInput,
        toggleRoleByLabel,
        removeSelectedRole,
        addSelectedPerson,
        removeContentPerson,
        resetPersonPicker,
        clearPersonSearchFields,
        formatContentPersonChip,
        PERSON_ROLE_LABELS,
    };
}

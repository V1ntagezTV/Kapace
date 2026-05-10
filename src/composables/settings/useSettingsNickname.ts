import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ErrorDetails } from '@/api/ApiService';
import { UserApi } from '@/api/UserApi';
import { StringExtensions } from '@/helpers/StringExtensions';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';

const DEBOUNCE_MS = 300;

/** null — без подсказки; иначе текст в плашке под полем */
export type NicknameAvailability =
    | null
    | 'available'
    | 'taken'
    | 'unchanged';

type UpdateResult =
    | { kind: 'success' }
    | { kind: 'business'; details: ErrorDetails }
    | { kind: 'failed' };

export function useSettingsNickname() {
    const user = userStore();
    const eventStore = ClientEventStore();
    const injectedUserApi = inject<UserApi>('user-api');
    if (!injectedUserApi) {
        throw new Error('Settings: провайдер user-api не найден');
    }
    const userApi = injectedUserApi;

    const nickname = ref(user.nickname);
    const pendingForce = ref(false);
    const availability = ref<NicknameAvailability>(null);
    const saving = ref(false);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    watch(
        () => user.nickname,
        (next) => {
            nickname.value = next;
            const trimmedNickname = nickname.value.trim();
            if (!StringExtensions.isNullOrEmpty(trimmedNickname) && trimmedNickname === next.trim()) {
                availability.value = 'unchanged';
                pendingForce.value = false;
            } else {
                resetNicknameFeedback();
            }
        }
    );

    onMounted(() => {
        const t = nickname.value.trim();
        if (!StringExtensions.isNullOrEmpty(t) && t === user.nickname.trim()) {
            availability.value = 'unchanged';
            pendingForce.value = false;
        }
    });

    function clearDebounce() {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    }

    onBeforeUnmount(() => clearDebounce());

    const isDirty = computed(
        () => nickname.value.trim() !== user.nickname.trim()
    );

    function resetNicknameFeedback() {
        pendingForce.value = false;
        availability.value = null;
    }

    async function tryUpdateNickname(isForce: boolean): Promise<UpdateResult> {
        const trimmed = nickname.value.trim();
        if (trimmed === user.nickname.trim()) {
            return { kind: 'failed' };
        }

        let networkError = false;
        const response = await userApi.UpdateNickname(trimmed, isForce);

        response.onException(() => {
            networkError = true;
            eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as never);
        });

        if (networkError) {
            return { kind: 'failed' };
        }

        if (response.data !== undefined) {
            return { kind: 'success' };
        }

        if (response.businessError) {
            return { kind: 'business', details: response.businessError };
        }

        return { kind: 'failed' };
    }

    function applyBusinessError(details: ErrorDetails) {
        if (details.ErrorCode === 'NicknameAlreadyExists') {
            availability.value = 'taken';
            pendingForce.value = false;
            return;
        }
        if (details.ErrorCode === 'CallWithoutForceFlag') {
            pendingForce.value = true;
            availability.value = 'available';
            return;
        }
        eventStore.push(details.Message, EventTypes.Error as never);
    }

    async function saveNickname() {
        const trimmed = nickname.value.trim();

        if (StringExtensions.isNullOrEmpty(trimmed)) {
            availability.value = 'taken';
            pendingForce.value = false;
            return;
        }

        if (trimmed === user.nickname.trim()) {
            availability.value = 'unchanged';
            pendingForce.value = false;
            return;
        }

        saving.value = true;
        try {
            const result = await tryUpdateNickname(pendingForce.value);
            if (result.kind === 'success') {
                user.UpdateNickname(trimmed);
                resetNicknameFeedback();
                eventStore.push('Успех! Новый никнейм сохранен!', EventTypes.Success as never);
                return;
            }
            if (result.kind === 'business') {
                applyBusinessError(result.details);
            }
        } finally {
            saving.value = false;
        }
    }

    async function runAvailabilityProbe() {
        if (!isDirty.value) {
            const t = nickname.value.trim();
            if (!StringExtensions.isNullOrEmpty(t)) {
                availability.value = 'unchanged';
                pendingForce.value = false;
            } else {
                resetNicknameFeedback();
            }
            return;
        }
        if (!StringExtensions.validateNickname(nickname.value)) {
            availability.value = 'taken';
            return;
        }

        pendingForce.value = false;
        availability.value = null;

        const result = await tryUpdateNickname(false);
        if (result.kind === 'success') {
            user.UpdateNickname(nickname.value.trim());
            resetNicknameFeedback();
            return;
        }
        if (result.kind === 'business') {
            applyBusinessError(result.details);
        }
    }

    function scheduleNicknameProbe() {
        clearDebounce();
        if (isDirty.value) {
            availability.value = null;
        }
        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            void runAvailabilityProbe();
        }, DEBOUNCE_MS);
    }

    function nicknameValidator(value: string) {
        return StringExtensions.validateNickname(value);
    }

    return {
        nickname,
        availability,
        saving,
        pendingForce,
        isDirty,
        saveNickname,
        scheduleNicknameProbe,
        nicknameValidator,
    };
}

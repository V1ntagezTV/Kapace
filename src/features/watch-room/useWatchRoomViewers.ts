/**
 * Загрузка ников/аватарок участников комнаты через get-short-users.
 * Кэширует ответы; при смене ParticipantUserIds догружает только недостающие id.
 */
import { computed, ref, watch, type Ref } from "vue";
import { UserApi, type V1ShortUser } from "@/api/UserApi";
import type { PlaybackSnapshot } from "@/features/watch-room/types";
import { resolveUserAvatarSrc } from "@/helpers/UserAvatarResolver";

export type WatchRoomViewerRole = "owner" | "moderator" | "viewer";

export type WatchRoomViewer = {
    userId: number;
    nickname: string;
    avatarSrc: string;
    role: WatchRoomViewerRole;
};

function toUserKey(userId: number | string): string {
    return String(userId);
}

function toUserApiIds(ids: number[]): Array<number | string> {
    return ids.map(id => (Number.isSafeInteger(id) ? id : String(id)));
}

function resolveRole(
    userId: number,
    ownerUserId: number,
    moderatorUserIds: number[]
): WatchRoomViewerRole {
    if (userId === ownerUserId) {
        return "owner";
    }
    if (moderatorUserIds.includes(userId)) {
        return "moderator";
    }
    return "viewer";
}

export function useWatchRoomViewers(room: Ref<PlaybackSnapshot | null>) {
    const userApi = new UserApi();
    const profiles = ref<Record<string, V1ShortUser>>({});
    const isLoading = ref(false);
    let requestGeneration = 0;

    const viewers = computed<WatchRoomViewer[]>(() => {
        const snapshot = room.value;
        if (!snapshot) {
            return [];
        }

        return snapshot.ParticipantUserIds.map(userId => {
            const profile = profiles.value[toUserKey(userId)];
            return {
                userId,
                nickname: profile?.Nickname?.trim() || `Пользователь ${userId}`,
                avatarSrc: resolveUserAvatarSrc(profile?.ImageLink),
                role: resolveRole(
                    userId,
                    snapshot.OwnerUserId,
                    snapshot.ModeratorUserIds
                ),
            };
        });
    });

    const viewerCount = computed(() => room.value?.ParticipantUserIds.length ?? 0);

    async function ensureProfiles(userIds: number[]): Promise<void> {
        const missingIds = userIds.filter(
            userId => !profiles.value[toUserKey(userId)]
        );
        if (missingIds.length === 0) {
            return;
        }

        const generation = ++requestGeneration;
        isLoading.value = true;
        try {
            const chunkSize = 100;
            for (let offset = 0; offset < missingIds.length; offset += chunkSize) {
                if (generation !== requestGeneration) {
                    return;
                }

                const chunk = missingIds.slice(offset, offset + chunkSize);
                const response = await userApi.getShortUsers({
                    UserIds: toUserApiIds(chunk),
                });
                if (generation !== requestGeneration || response.error) {
                    continue;
                }

                const loadedUsers = response.data?.Users ?? [];
                if (loadedUsers.length === 0) {
                    continue;
                }

                const nextProfiles = { ...profiles.value };
                for (const shortUser of loadedUsers) {
                    nextProfiles[toUserKey(shortUser.UserId)] = shortUser;
                }
                profiles.value = nextProfiles;
            }
        } finally {
            if (generation === requestGeneration) {
                isLoading.value = false;
            }
        }
    }

    watch(
        () => room.value?.ParticipantUserIds.join(",") ?? "",
        () => {
            const ids = room.value?.ParticipantUserIds ?? [];
            if (ids.length === 0) {
                return;
            }
            void ensureProfiles(ids);
        },
        { immediate: true }
    );

    function resolveNickname(userId: number): string {
        const profile = profiles.value[toUserKey(userId)];
        return profile?.Nickname?.trim() || `Пользователь ${userId}`;
    }

    const nicknameByUserId = computed<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        for (const [userId, profile] of Object.entries(profiles.value)) {
            map[userId] = profile.Nickname?.trim() || `Пользователь ${userId}`;
        }
        return map;
    });

    return {
        viewers,
        viewerCount,
        isLoading,
        resolveNickname,
        nicknameByUserId,
        ensureProfiles,
    };
}

export function viewerRoleLabel(role: WatchRoomViewerRole): string {
    switch (role) {
        case "owner":
            return "Создатель";
        case "moderator":
            return "Модератор";
        default:
            return "Зритель";
    }
}

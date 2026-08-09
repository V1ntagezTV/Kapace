/**
 * Лента системных событий комнаты (вход/выход зрителей).
 * ActorUserId в snapshot нет — diff ParticipantUserIds при Reason Joined/Left.
 */
import { ref, watch, type Ref } from "vue";
import type { PlaybackSnapshot } from "@/features/watch-room/types";

export type WatchRoomActivityEventType = "joined" | "left";

export type WatchRoomActivityEvent = {
    id: string;
    type: WatchRoomActivityEventType;
    userId: number;
    at: number;
};

export function useWatchRoomActivityFeed(
    room: Ref<PlaybackSnapshot | null>,
    options: {
        ensureProfiles?: (userIds: number[]) => Promise<void>;
    } = {}
) {
    const events = ref<WatchRoomActivityEvent[]>([]);
    let previousIds: number[] | null = null;
    let previousRoomId: string | null = null;
    let eventSeq = 0;

    function resetFeed(): void {
        events.value = [];
        previousIds = null;
        previousRoomId = null;
        eventSeq = 0;
    }

    function appendEvents(
        type: WatchRoomActivityEventType,
        userIds: number[],
        at: number
    ): void {
        if (userIds.length === 0) {
            return;
        }

        const next = [...events.value];
        for (const userId of userIds) {
            eventSeq += 1;
            next.push({
                id: `${type}-${userId}-${eventSeq}`,
                type,
                userId,
                at,
            });
        }
        events.value = next;
    }

    watch(
        room,
        snapshot => {
            if (!snapshot) {
                resetFeed();
                return;
            }

            const nextIds = [...snapshot.ParticipantUserIds];
            const at = Date.now();

            if (previousRoomId !== snapshot.RoomId) {
                events.value = [];
                eventSeq = 0;
                previousRoomId = snapshot.RoomId;
                previousIds = nextIds;
                return;
            }

            if (previousIds === null) {
                previousIds = nextIds;
                return;
            }

            const prevSet = new Set(previousIds);
            const nextSet = new Set(nextIds);
            const joinedIds = nextIds.filter(id => !prevSet.has(id));
            const leftIds = previousIds.filter(id => !nextSet.has(id));

            if (snapshot.Reason === "Joined" || snapshot.Reason === "Left") {
                const touchedIds = [...joinedIds, ...leftIds];
                if (touchedIds.length > 0 && options.ensureProfiles) {
                    void options.ensureProfiles(touchedIds);
                }
                if (snapshot.Reason === "Joined") {
                    appendEvents("joined", joinedIds, at);
                } else {
                    appendEvents("left", leftIds, at);
                }
            }

            previousIds = nextIds;
        },
        { flush: "sync" }
    );

    return {
        events,
    };
}

/**
 * Оркестратор комнаты совместного просмотра.
 *
 * Ответственность:
 * - подключение к Hub и обработка PlaybackStateChanged;
 * - применение снимка к SyncPlayer (play/pause/seek);
 * - нативные действия owner/mod → Hub Play/Pause/Seek;
 * - режимы LIVE (синхрон) / OFFLINE (локальная пауза или перемотка зрителя);
 * - обход autoplay и периодическая догонка позиции у LIVE-зрителей.
 *
 * Снимок комнаты — единственный источник истины; локальный плеер ему подчиняется,
 * пока пользователь не ушёл в OFFLINE (кнопка «Синхронизироваться» возвращает).
 */
import {
    computed,
    onBeforeUnmount,
    ref,
    watch,
    type ComputedRef,
    type Ref,
} from "vue";
import { ClientEventStore, EventTypes } from "@/store/ClientEventStore";
import { userStore } from "@/store/UserStore";
import {getEffectivePosition, getHubErrorMessage, isWatchRoomUnauthorizedError} from "./playback";
import { WatchRoomAuthSession } from "@/api/WatchRoomAuthSession";
import type {SyncPlayer, SyncPlayerPlaybackState} from "./player/SyncPlayer";
import { resolveVideoInput } from "./player/resolveVideoInput";
import type {PlaybackChangeReason, PlaybackSnapshot, WatchRoomConnectionStatus} from "./types";
import { WatchRoomService } from "./WatchRoomService";

/** Как часто ищем локальную перемотку / drift модератора. */
const localModeDetectionIntervalMs = 500;
/** Как часто LIVE-клиент сверяет play/pause и позицию с комнатой. */
const playbackReconcileIntervalMs = 2_000;
/** Пауза после окончания скраббинга, прежде чем слать Seek в Hub. */
const nativeSeekDebounceMs = 400;
const positionIntervalMs = 500;
/** Порог расхождения позиции (сек), после которого считаем seek/drift. */
const maximumDriftSeconds = 1.5;
/** Минимальный зазор, чтобы вообще вызывать seekTo у плеера. */
const seekSkipThresholdSeconds = 0.35;
/** При этих Reason seek почти всегда нужен, даже при малом delta. */
const seekForceReasons = new Set<PlaybackChangeReason>(["Seek", "Play", "Pause"]);
/** Игнор нативных play/pause сразу после программного применения снимка. */
const nativeMismatchGraceMs = 1_500;
const playbackReasonValues: PlaybackChangeReason[] = [
    "Created",
    "Joined",
    "Left",
    "Play",
    "Pause",
    "Seek",
    "ModeratorGranted",
    "ModeratorRevoked",
];
const playbackReasons = new Set<PlaybackChangeReason>(playbackReasonValues);

/** Клиентская ошибка валидации снимка/ввода (показывается в toast как есть). */
class WatchRoomValidationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "WatchRoomValidationError";
    }
}

type NativeAdminCommand =
    | { kind: "play" }
    | { kind: "pause" }
    | {
        kind: "seek";
        position: number;
        isPlaying: boolean;
    };

/** Публичный API composable для страницы /watch-room. */
export type UseWatchRoom = {
    room: Ref<PlaybackSnapshot | null>;
    connectionStatus: Ref<WatchRoomConnectionStatus>;
    isBusy: Ref<boolean>;
    isLocallyDetached: Ref<boolean>;
    isPlaybackUnlockRequired: Ref<boolean>;
    canControl: ComputedRef<boolean>;
    isOwner: ComputedRef<boolean>;
    currentPosition: Ref<number>;
    displayPosition: Ref<number>;
    duration: Ref<number>;
    pendingSeekPosition: Ref<number | null>;
    start(): Promise<void>;
    connect(): Promise<void>;
    createRoom(videoUrl: string): Promise<void>;
    joinRoom(roomId: string): Promise<void>;
    leaveRoom(): Promise<void>;
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(seconds: number): Promise<void>;
    syncToRoom(): Promise<void>;
    unlockPlayback(): Promise<void>;
    setSeekInteractionActive(active: boolean): void;
    grantModerator(userId: number): Promise<void>;
    revokeModerator(userId: number): Promise<void>;
    dispose(): Promise<void>;
};

/** Непустая строка после trim; иначе WatchRoomValidationError. */
function requireText(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
        throw new WatchRoomValidationError(`${fieldName} имеет некорректный формат.`);
    }

    const trimmed = value.trim();
    if (!trimmed) {
        throw new WatchRoomValidationError(`${fieldName} не может быть пустым.`);
    }

    return trimmed;
}

/** Конечное неотрицательное число позиции в секундах. */
function requirePosition(value: unknown): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new WatchRoomValidationError(
            "Позиция воспроизведения должна быть конечным неотрицательным числом."
        );
    }

    return value;
}

/** Положительный безопасный integer user id. */
function requireUserId(value: unknown): number {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
        throw new WatchRoomValidationError(
            "Идентификатор пользователя должен быть положительным безопасным целым числом."
        );
    }

    return value;
}

/** Поле-за-полем сравнение двух снимков (для отсечения дублей одной Version). */
function snapshotsAreEqual(
    first: PlaybackSnapshot,
    second: PlaybackSnapshot
): boolean {
    return first.RoomId === second.RoomId
        && first.VideoUrl === second.VideoUrl
        && first.PositionSeconds === second.PositionSeconds
        && first.IsPlaying === second.IsPlaying
        && first.UpdatedAtUtc === second.UpdatedAtUtc
        && first.Version === second.Version
        && first.Reason === second.Reason
        && first.OwnerUserId === second.OwnerUserId
        && first.ParticipantUserIds.length === second.ParticipantUserIds.length
        && first.ParticipantUserIds.every(
            (userId, index) => userId === second.ParticipantUserIds[index]
        )
        && first.ModeratorUserIds.length === second.ModeratorUserIds.length
        && first.ModeratorUserIds.every(
            (userId, index) => userId === second.ModeratorUserIds[index]
        );
}

/** Бэкенд может отдать Reason строкой или числом enum — нормализуем к строке. */
function normalizePlaybackReason(value: unknown): PlaybackChangeReason {
    if (typeof value === "string" && playbackReasons.has(value as PlaybackChangeReason)) {
        return value as PlaybackChangeReason;
    }

    const numericValue = typeof value === "number"
        ? value
        : typeof value === "string" && /^\d+$/.test(value)
            ? Number(value)
            : Number.NaN;
    if (Number.isSafeInteger(numericValue) && playbackReasonValues[numericValue]) {
        return playbackReasonValues[numericValue];
    }

    return value as PlaybackChangeReason;
}

/** Приводит ответ Hub к PlaybackSnapshot (PascalCase или camelCase). */
function normalizePlaybackSnapshot(value: unknown): PlaybackSnapshot {
    if (!value || typeof value !== "object") {
        throw new WatchRoomValidationError("Сервер вернул некорректное состояние комнаты.");
    }

    const raw = value as Record<string, unknown>;
    const read = (pascalCase: string, camelCase: string): unknown =>
        raw[pascalCase] ?? raw[camelCase];

    return {
        RoomId: read("RoomId", "roomId") as string,
        VideoUrl: read("VideoUrl", "videoUrl") as string,
        PositionSeconds: read("PositionSeconds", "positionSeconds") as number,
        IsPlaying: read("IsPlaying", "isPlaying") as boolean,
        UpdatedAtUtc: read("UpdatedAtUtc", "updatedAtUtc") as string,
        Version: read("Version", "version") as number,
        Reason: normalizePlaybackReason(read("Reason", "reason")),
        OwnerUserId: read("OwnerUserId", "ownerUserId") as number,
        ModeratorUserIds: read("ModeratorUserIds", "moderatorUserIds") as number[],
        ParticipantUserIds: read("ParticipantUserIds", "participantUserIds") as number[],
    };
}

/** Проверяет инварианты PlaybackSnapshot после нормализации; бросает при нарушении. */
function validateSnapshot(snapshot: PlaybackSnapshot): void {
    requireText(snapshot.RoomId, "Идентификатор комнаты");
    requireText(snapshot.VideoUrl, "Ссылка на видео");
    requirePosition(snapshot.PositionSeconds);
    requireUserId(snapshot.OwnerUserId);

    if (typeof snapshot.IsPlaying !== "boolean") {
        throw new WatchRoomValidationError("Сервер вернул некорректный статус воспроизведения.");
    }
    if (typeof snapshot.UpdatedAtUtc !== "string" || !Number.isFinite(Date.parse(snapshot.UpdatedAtUtc))) {
        throw new WatchRoomValidationError("Сервер вернул некорректное время обновления комнаты.");
    }
    if (typeof snapshot.Version !== "number"
        || !Number.isSafeInteger(snapshot.Version)
        || snapshot.Version < 0) {
        throw new WatchRoomValidationError("Сервер вернул некорректную версию комнаты.");
    }
    if (!playbackReasons.has(snapshot.Reason)) {
        throw new WatchRoomValidationError("Сервер вернул неизвестную причину обновления комнаты.");
    }
    if (!Array.isArray(snapshot.ModeratorUserIds)) {
        throw new WatchRoomValidationError("Сервер вернул некорректный список модераторов.");
    }
    snapshot.ModeratorUserIds.forEach(requireUserId);
    if (!Array.isArray(snapshot.ParticipantUserIds)) {
        throw new WatchRoomValidationError("Сервер вернул некорректный список участников.");
    }
    snapshot.ParticipantUserIds.forEach(requireUserId);
}

/**
 * Composable страницы /watch-room.
 * @param player ref на SyncPlayer (создаётся во View после mount контейнера).
 */
export function useWatchRoom(player: Ref<SyncPlayer | null>): UseWatchRoom {
    const service = new WatchRoomService();
    const eventStore = ClientEventStore();
    const currentUser = userStore();

    const room = ref<PlaybackSnapshot | null>(null);
    const connectionStatus = ref<WatchRoomConnectionStatus>("disconnected");
    const isBusy = ref(false);
    /** true = пользователь локально отмотал и не следует комнате (OFFLINE). */
    const isLocallyDetached = ref(false);
    /** true = браузер заблокировал autoplay; нужен клик по оверлею. */
    const isPlaybackUnlockRequired = ref(false);
    const currentPosition = ref(0);
    const displayPosition = currentPosition;
    const duration = ref(0);
    const pendingSeekPosition = ref<number | null>(null);

    const isOwner = computed(() => {
        const userId = currentUser.userId;
        return Number.isSafeInteger(userId)
            && userId > 0
            && room.value?.OwnerUserId === userId;
    });
    const canControl = computed(() => {
        if (connectionStatus.value !== "connected") {
            return false;
        }

        const userId = currentUser.userId;
        return isOwner.value || (
            Number.isSafeInteger(userId)
            && userId > 0
            && Boolean(room.value?.ModeratorUserIds.includes(userId))
        );
    });

    let busyOperations = 0;
    let lastVersion = -1;
    let eventGeneration = 0;
    let acceptsPlaybackEvents = true;
    let disposed = false;
    let eventQueue: Promise<void> = Promise.resolve();
    let playerQueue: Promise<void> = Promise.resolve();
    let loadedPlayer: SyncPlayer | null = null;
    let loadedVideoUrl: string | null = null;
    let previousStatus: WatchRoomConnectionStatus = "disconnected";
    let reconnectEpoch = 0;
    let disposePromise: Promise<void> | null = null;
    let durationRequestPending = false;
    let seekInteractionActive = false;
    let programmaticPlayerOperations = 0;
    let ignoreNativeMismatchUntil = 0;
    let lastPlayerState: SyncPlayerPlaybackState | null = null;
    let nativeAdminTargetIsPlaying: boolean | null = null;
    let lastLocalPlaybackSample: {
        adapter: SyncPlayer;
        generation: number;
        position: number;
        sampledAt: number;
        wasPlaying: boolean;
    } | null = null;
    let unsubscribePlayerState: (() => void) | null = null;
    let nativeSeekTimeoutId: number | null = null;
    let pendingNativeAdminCommand: NativeAdminCommand | null = null;
    let nativeAdminCommandPromise: Promise<void> | null = null;
    const activeRejoins = new Set<Promise<void>>();
    const observedPlayers = new Set<SyncPlayer>();

    /**
     * Показывает ошибку в ClientEventStore.
     * 401 Hub → чистит JWT и просит перелогиниться.
     * @param hubError true — разобрать как ошибку Hub (коды → русский текст).
     */
    const reportError = (error: unknown, hubError: boolean): void => {
        if (disposed) {
            return;
        }

        if (isWatchRoomUnauthorizedError(error)) {
            WatchRoomAuthSession.clear();
            eventStore.push(
                "Сессия комнаты истекла или недействительна. Войдите снова.",
                EventTypes.Error
            );
            return;
        }

        const message = error instanceof WatchRoomValidationError
            ? error.message
            : hubError
                ? getHubErrorMessage(error)
                : error instanceof Error
                    ? error.message
                    : "Не удалось синхронизировать воспроизведение.";
        eventStore.push(message, EventTypes.Error);
    };

    /**
     * Сериализует операции над плеером (load/seek/play/pause),
     * чтобы параллельные снимки не гонялись.
     * @param propagateError true — пробросить reject вызывающему (sync/unlock).
     */
    const enqueuePlayerOperation = (
        operation: () => Promise<void>,
        propagateError = false
    ): Promise<void> => {
        const queued = playerQueue.then(operation);
        playerQueue = queued.catch(error => {
            if (!propagateError) {
                reportError(error, false);
            }
        });
        return propagateError ? queued : playerQueue;
    };

    /**
     * Очередь Hub-команд от нативных действий owner/mod.
     * Повторные события во время активного invoke схлопываются в последнюю команду.
     */
    const queueNativeAdminCommand = (
        command: NativeAdminCommand
    ): void => {
        if (command.kind === "play" || command.kind === "pause") {
            nativeAdminTargetIsPlaying = command.kind === "play";
        }
        pendingNativeAdminCommand = command;
        if (nativeAdminCommandPromise || disposed) {
            return;
        }

        nativeAdminCommandPromise = (async () => {
            while (pendingNativeAdminCommand && !disposed) {
                const nextCommand = pendingNativeAdminCommand;
                pendingNativeAdminCommand = null;
                const snapshot = room.value;
                const adapter = player.value;
                const generation = eventGeneration;
                if (
                    !snapshot
                    || !adapter
                    || !canControl.value
                    || connectionStatus.value !== "connected"
                ) {
                    continue;
                }

                try {
                    const position = nextCommand.kind === "seek"
                        ? requirePosition(nextCommand.position)
                        : requirePosition(await adapter.getCurrentTime());
                    if (
                        disposed
                        || generation !== eventGeneration
                        || room.value !== snapshot
                        || player.value !== adapter
                        || !canControl.value
                    ) {
                        continue;
                    }

                    isLocallyDetached.value = false;
                    if (nextCommand.kind === "play") {
                        await service.play({
                            RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                            PositionSeconds: position,
                        });
                    } else if (nextCommand.kind === "pause") {
                        await service.pause({
                            RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                            PositionSeconds: position,
                        });
                    } else {
                        await service.seek({
                            RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                            PositionSeconds: position,
                            IsPlaying: nativeAdminTargetIsPlaying
                                ?? (lastPlayerState === "playing"
                                    ? true
                                    : lastPlayerState === "paused"
                                        ? false
                                        : nextCommand.isPlaying),
                        });
                    }
                } catch (error) {
                    if (!disposed) {
                        nativeAdminTargetIsPlaying = null;
                        isLocallyDetached.value = true;
                        reportError(error, true);
                    }
                }
            }
        })().finally(() => {
            nativeAdminCommandPromise = null;
            if (pendingNativeAdminCommand && !disposed) {
                queueNativeAdminCommand(pendingNativeAdminCommand);
            }
        });
    };

    /**
     * Реакция на onStateChange YouTube.
     * Owner/mod → Play/Pause в Hub;
     * зритель на pause/ended в LIVE → OFFLINE и локальная остановка;
     * иное расхождение у зрителя → повторно применить снимок комнаты.
     */
    const handleNativePlaybackState = (
        state: SyncPlayerPlaybackState
    ): void => {
        lastPlayerState = state;
        if (
            disposed
            || programmaticPlayerOperations > 0
            || Date.now() < ignoreNativeMismatchUntil
        ) {
            return;
        }

        const snapshot = room.value;
        if (!snapshot || connectionStatus.value !== "connected") {
            return;
        }

        // Ролик закончился: остаёмся на конце без автоперезапуска.
        if (state === "ended") {
            if (canControl.value) {
                if (snapshot.IsPlaying) {
                    queueNativeAdminCommand({ kind: "pause" });
                }
            } else if (!isLocallyDetached.value) {
                isLocallyDetached.value = true;
            }
            return;
        }

        if (state !== "playing" && state !== "paused") {
            return;
        }

        const isPlaying = state === "playing";
        const sharedTargetIsPlaying = nativeAdminTargetIsPlaying
            ?? snapshot.IsPlaying;
        if (sharedTargetIsPlaying === isPlaying) {
            return;
        }

        if (canControl.value) {
            queueNativeAdminCommand({
                kind: isPlaying ? "play" : "pause",
            });
        } else if (!isPlaying && snapshot.IsPlaying) {
            // Зритель нажал паузу в LIVE → OFFLINE, видео остаётся на паузе.
            isLocallyDetached.value = true;
        } else {
            const generation = eventGeneration;
            void enqueuePlayerOperation(
                () => applySnapshotToPlayer(snapshot, generation)
            );
        }
    };

    /**
     * Debounce Hub Seek после нативной перемотки owner/mod.
     * Сбрасывается при каждом новом скраббе, пока пользователь не остановился.
     */
    const scheduleNativeAdminSeek = (
        adapter: SyncPlayer,
        roomId: string,
        generation: number,
        position: number,
        isPlaying: boolean
    ): void => {
        if (nativeSeekTimeoutId !== null) {
            window.clearTimeout(nativeSeekTimeoutId);
        }

        nativeSeekTimeoutId = window.setTimeout(() => {
            nativeSeekTimeoutId = null;
            if (
                disposed
                || generation !== eventGeneration
                || room.value?.RoomId !== roomId
                || player.value !== adapter
                || !canControl.value
            ) {
                return;
            }

            queueNativeAdminCommand({
                kind: "seek",
                position,
                isPlaying: nativeAdminTargetIsPlaying
                    ?? (lastPlayerState === "playing"
                        ? true
                        : lastPlayerState === "paused"
                            ? false
                            : isPlaying),
            });
        }, nativeSeekDebounceMs);
    };

    /** Обновляет currentPosition из pendingSeek или эффективной позиции комнаты. */
    const updateDisplayedPosition = (): void => {
        const snapshot = room.value;
        currentPosition.value = pendingSeekPosition.value
            ?? (snapshot ? getEffectivePosition(snapshot) : 0);
    };

    /** Подтягивает duration ролика после cue (метаданные могут появиться с задержкой). */
    const updateDuration = async (
        adapter: SyncPlayer,
        snapshot: PlaybackSnapshot,
        generation: number
    ): Promise<void> => {
        try {
            const nextDuration = await adapter.getDuration();
            if (
                disposed
                || generation !== eventGeneration
                || player.value !== adapter
                || room.value !== snapshot
            ) {
                return;
            }

            duration.value = Number.isFinite(nextDuration) && nextDuration >= 0
                ? nextDuration
                : 0;
        } catch {
            // Metadata may not be available immediately after cueing the video.
        }
    };

    /** Применить актуальный снимок к iframe: load → seek (если нужно) → play/pause. */
    const applySnapshotToPlayer = async (
        snapshot: PlaybackSnapshot,
        generation: number,
        force = false
    ): Promise<void> => {
        if (
            disposed
            || generation !== eventGeneration
            || (!force && isLocallyDetached.value)
        ) {
            return;
        }

        const adapter = player.value;
        if (!adapter) {
            return;
        }

        observedPlayers.add(adapter);
        if (loadedPlayer !== adapter || loadedVideoUrl !== snapshot.VideoUrl) {
            duration.value = 0;
            await adapter.load(snapshot.VideoUrl);
            if (
                disposed
                || generation !== eventGeneration
                || player.value !== adapter
                || (!force && isLocallyDetached.value)
            ) {
                return;
            }
            loadedPlayer = adapter;
            loadedVideoUrl = snapshot.VideoUrl;
        }

        await updateDuration(adapter, snapshot, generation);

        if (
            disposed
            || generation !== eventGeneration
            || player.value !== adapter
            || room.value !== snapshot
            || (!force && isLocallyDetached.value)
        ) {
            return;
        }

        // AllPlay и подобные: только общий VideoUrl + исходящие события в Hub.
        if (!adapter.supportsProgrammaticPlayback()) {
            isPlaybackUnlockRequired.value = false;
            return;
        }

        programmaticPlayerOperations += 1;
        try {
            lastLocalPlaybackSample = null;
            const targetPosition = requirePosition(getEffectivePosition(snapshot));
            let currentPositionSeconds = targetPosition;
            try {
                currentPositionSeconds = requirePosition(
                    await adapter.getCurrentTime()
                );
            } catch {
                currentPositionSeconds = targetPosition;
            }

            const needsSeek = seekForceReasons.has(snapshot.Reason)
                || Math.abs(currentPositionSeconds - targetPosition)
                    > seekSkipThresholdSeconds;

            if (snapshot.IsPlaying) {
                if (needsSeek) {
                    await adapter.seekTo(targetPosition);
                }
                if (
                    disposed
                    || generation !== eventGeneration
                    || player.value !== adapter
                    || room.value !== snapshot
                    || (!force && isLocallyDetached.value)
                ) {
                    return;
                }
                await adapter.play();
                const playbackState = await adapter.getPlaybackState();
                if (
                    !disposed
                    && generation === eventGeneration
                    && player.value === adapter
                    && room.value === snapshot
                    && playbackState !== "playing"
                    && playbackState !== "buffering"
                ) {
                    isPlaybackUnlockRequired.value = true;
                } else if (playbackState === "playing" || playbackState === "buffering") {
                    isPlaybackUnlockRequired.value = false;
                }
            } else {
                isPlaybackUnlockRequired.value = false;
                await adapter.pause();
                if (
                    disposed
                    || generation !== eventGeneration
                    || player.value !== adapter
                    || room.value !== snapshot
                    || (!force && isLocallyDetached.value)
                ) {
                    return;
                }
                if (needsSeek) {
                    await adapter.seekTo(targetPosition);
                    await adapter.pause();
                }
            }
        } finally {
            programmaticPlayerOperations -= 1;
            ignoreNativeMismatchUntil = Date.now() + nativeMismatchGraceMs;
        }
    };

    /**
     * Входящий PlaybackStateChanged / нормализованный снимок.
     * Обновляет UI всегда; плеер — только в LIVE (или force через sync/unlock).
     */
    const handlePlaybackSnapshot = async (
        rawIncoming: unknown,
        generation: number
    ): Promise<void> => {
        if (disposed || !acceptsPlaybackEvents || generation !== eventGeneration) {
            return;
        }

        const incoming = normalizePlaybackSnapshot(rawIncoming);
        validateSnapshot(incoming);
        if (incoming.Version < lastVersion) {
            return;
        }
        if (
            incoming.Version === lastVersion
            && room.value
            && snapshotsAreEqual(incoming, room.value)
        ) {
            return;
        }

        const snapshot: PlaybackSnapshot = {
            ...incoming,
            ModeratorUserIds: [...incoming.ModeratorUserIds],
            ParticipantUserIds: [...incoming.ParticipantUserIds],
        };
        if (room.value?.VideoUrl !== snapshot.VideoUrl) {
            duration.value = 0;
        }
        lastVersion = snapshot.Version;
        room.value = snapshot;
        if (
            nativeAdminTargetIsPlaying !== null
            && snapshot.IsPlaying === nativeAdminTargetIsPlaying
        ) {
            nativeAdminTargetIsPlaying = null;
        }
        pendingSeekPosition.value = null;
        updateDisplayedPosition();

        if (player.value && !isLocallyDetached.value) {
            await enqueuePlayerOperation(
                () => applySnapshotToPlayer(snapshot, generation)
            );
        }
    };

    /** Ставит входящий снимок в очередь событий (сериализация handlePlaybackSnapshot). */
    const enqueuePlaybackSnapshot = (snapshot: unknown): void => {
        const generation = eventGeneration;
        const queued = eventQueue.then(
            () => handlePlaybackSnapshot(snapshot, generation)
        );
        eventQueue = queued.catch(error => {
            reportError(error, false);
        });
    };

    /**
     * Сбрасывает локальное состояние комнаты и инвалидирует in-flight операции
     * (инкремент eventGeneration). Плеер не трогает.
     */
    const clearRoom = (): void => {
        eventGeneration += 1;
        lastVersion = -1;
        acceptsPlaybackEvents = false;
        room.value = null;
        isLocallyDetached.value = false;
        isPlaybackUnlockRequired.value = false;
        pendingSeekPosition.value = null;
        currentPosition.value = 0;
        duration.value = 0;
        seekInteractionActive = false;
        pendingNativeAdminCommand = null;
        nativeAdminTargetIsPlaying = null;
        lastLocalPlaybackSample = null;
        ignoreNativeMismatchUntil = 0;
        if (nativeSeekTimeoutId !== null) {
            window.clearTimeout(nativeSeekTimeoutId);
            nativeSeekTimeoutId = null;
        }
    };

    /** clearRoom + best-effort pause текущего адаптера. */
    const clearRoomAndPausePlayer = (): Promise<void> => {
        clearRoom();

        const adapter = player.value;
        if (!adapter) {
            return Promise.resolve();
        }

        return enqueuePlayerOperation(async () => {
            if (player.value !== adapter) {
                return;
            }

            try {
                await adapter.pause();
            } catch {
                // Clearing local room state must not depend on the adapter.
            }
        });
    };

    /**
     * После reconnect SignalR повторно вызывает JoinRoom для текущей RoomId.
     * При ошибке чистит комнату; успех ждёт PlaybackStateChanged.
     */
    const rejoinAfterReconnect = (
        roomId: string,
        generation: number,
        epoch: number
    ): void => {
        if (disposed) {
            return;
        }

        const operation = (async () => {
            try {
                await service.joinRoom({ RoomId: roomId });
                // PlaybackStateChanged remains the only source of room state.
                if (
                    !disposed
                    && epoch === reconnectEpoch
                    && generation === eventGeneration
                    && room.value?.RoomId === roomId
                    && previousStatus === "connected"
                ) {
                    connectionStatus.value = "connected";
                }
            } catch (error) {
                const membershipIsCurrent = !disposed
                    && epoch === reconnectEpoch
                    && generation === eventGeneration
                    && room.value?.RoomId === roomId;
                if (!membershipIsCurrent) {
                    return;
                }

                const clearing = clearRoomAndPausePlayer();
                const clearedGeneration = eventGeneration;
                reportError(error, true);
                await clearing;

                if (
                    !disposed
                    && epoch === reconnectEpoch
                    && clearedGeneration === eventGeneration
                    && !room.value
                    && previousStatus === "connected"
                ) {
                    connectionStatus.value = "connected";
                }
            }
        })();

        let trackedAttempt: Promise<void>;
        trackedAttempt = operation
            .catch(() => undefined)
            .finally(() => {
                activeRejoins.delete(trackedAttempt);
            });
        activeRejoins.add(trackedAttempt);
    };

    const unsubscribePlayback = service.onPlaybackStateChanged(
        enqueuePlaybackSnapshot
    );
    const unsubscribeStatus = service.subscribeConnectionStatus(status => {
        const wasReconnecting = previousStatus === "reconnecting";
        previousStatus = status;
        if (status === "reconnecting") {
            reconnectEpoch += 1;
        }

        if (
            wasReconnecting
            && status === "connected"
            && room.value
            && !disposed
        ) {
            connectionStatus.value = "reconnecting";
            rejoinAfterReconnect(
                room.value.RoomId,
                eventGeneration,
                reconnectEpoch
            );
            return;
        }

        connectionStatus.value = status;
        if (
            wasReconnecting
            && status === "disconnected"
            && room.value
            && !disposed
        ) {
            void clearRoomAndPausePlayer();
            eventStore.push(
                "Соединение с комнатой потеряно. Войдите в комнату снова.",
                EventTypes.Error
            );
        }
    });

    /**
     * Следит за сменой SyncPlayer в ref:
     * переподписывается на onPlaybackStateChanged и применяет текущий снимок.
     */
    const stopPlayerWatch = watch(player, nextPlayer => {
        unsubscribePlayerState?.();
        unsubscribePlayerState = null;
        lastPlayerState = null;
        lastLocalPlaybackSample = null;

        if (!nextPlayer || disposed) {
            return;
        }

        observedPlayers.add(nextPlayer);
        try {
            unsubscribePlayerState = nextPlayer.onPlaybackStateChanged(
                handleNativePlaybackState
            );
        } catch (error) {
            reportError(error, false);
        }

        const snapshot = room.value;
        const generation = eventGeneration;
        if (snapshot) {
            void enqueuePlayerOperation(
                () => applySnapshotToPlayer(snapshot, generation)
            );
        }
    }, { immediate: true });

    /** Тик UI-позиции (эффективная позиция комнаты / pendingSeek). */
    const positionTimerId = window.setInterval(
        updateDisplayedPosition,
        positionIntervalMs
    );
    /**
     * Детектор локальной перемотки.
     * Модератор: расхождение с эффективной позицией комнаты → Hub Seek.
     * Зритель: скачок позиции + уход от комнаты → OFFLINE.
     */
    const localModeDetectionTimerId = window.setInterval(() => {
        const snapshot = room.value;
        const adapter = player.value;
        const generation = eventGeneration;
        if (
            disposed
            || seekInteractionActive
            || programmaticPlayerOperations > 0
            || Date.now() < ignoreNativeMismatchUntil
            || (isLocallyDetached.value && !canControl.value)
            || connectionStatus.value !== "connected"
            || !snapshot
            || !adapter
        ) {
            return;
        }

        void enqueuePlayerOperation(async () => {
            if (
                disposed
                || seekInteractionActive
                || programmaticPlayerOperations > 0
                || Date.now() < ignoreNativeMismatchUntil
                || (isLocallyDetached.value && !canControl.value)
                || generation !== eventGeneration
                || connectionStatus.value !== "connected"
                || room.value !== snapshot
                || player.value !== adapter
            ) {
                return;
            }

            const actual = requirePosition(await adapter.getCurrentTime());
            const sampledAt = Date.now();
            const expectedRoomPosition = requirePosition(
                getEffectivePosition(snapshot, sampledAt)
            );
            const driftFromRoom = Math.abs(actual - expectedRoomPosition);
            const previousSample = lastLocalPlaybackSample;
            lastLocalPlaybackSample = {
                adapter,
                generation,
                position: actual,
                sampledAt,
                wasPlaying: lastPlayerState === "playing",
            };

            if (canControl.value) {
                // Moderators: any lasting divergence from the shared timeline is a seek.
                if (driftFromRoom > maximumDriftSeconds) {
                    scheduleNativeAdminSeek(
                        adapter,
                        snapshot.RoomId,
                        generation,
                        actual,
                        lastPlayerState === "playing"
                            ? true
                            : lastPlayerState === "paused"
                                ? false
                                : snapshot.IsPlaying
                    );
                }
                return;
            }

            if (
                !previousSample
                || previousSample.adapter !== adapter
                || previousSample.generation !== generation
            ) {
                return;
            }

            const elapsedSeconds = Math.max(
                0,
                (sampledAt - previousSample.sampledAt) / 1000
            );
            const expectedDelta = previousSample.wasPlaying
                ? elapsedSeconds
                : 0;
            const actualDelta = actual - previousSample.position;
            const positionJump = Math.abs(actualDelta - expectedDelta);
            // Зритель уходит в OFFLINE при заметном локальном scrub.
            if (
                positionJump > maximumDriftSeconds
                && driftFromRoom > maximumDriftSeconds
            ) {
                isLocallyDetached.value = true;
            }
        });
    }, localModeDetectionIntervalMs);
    /**
     * Периодическая догонка LIVE-клиента: позиция у зрителей и play/pause у всех.
     * Модераторам позицию здесь не навязываем — они публикуют Seek сами.
     */
    const playbackReconcileTimerId = window.setInterval(() => {
        const snapshot = room.value;
        const adapter = player.value;
        const generation = eventGeneration;
        if (
            disposed
            || isLocallyDetached.value
            || seekInteractionActive
            || programmaticPlayerOperations > 0
            || connectionStatus.value !== "connected"
            || !snapshot
            || !adapter
        ) {
            return;
        }

        void enqueuePlayerOperation(async () => {
            if (
                disposed
                || isLocallyDetached.value
                || seekInteractionActive
                || programmaticPlayerOperations > 0
                || generation !== eventGeneration
                || connectionStatus.value !== "connected"
                || room.value !== snapshot
                || player.value !== adapter
            ) {
                return;
            }

            const expected = requirePosition(getEffectivePosition(snapshot));
            const actual = requirePosition(await adapter.getCurrentTime());
            // Only viewers are pulled back to the shared timeline here.
            // Moderators publish their local scrub via Seek instead.
            if (
                !canControl.value
                && Math.abs(actual - expected) > maximumDriftSeconds
            ) {
                programmaticPlayerOperations += 1;
                try {
                    lastLocalPlaybackSample = null;
                    await adapter.seekTo(expected);
                } finally {
                    programmaticPlayerOperations -= 1;
                    ignoreNativeMismatchUntil = Date.now() + nativeMismatchGraceMs;
                }
            }

            const playbackState = await adapter.getPlaybackState();
            // ENDED: не перезапускаем ролик; pause для комнаты шлёт onStateChange.
            if (playbackState === "ended") {
                return;
            }

            const isPlayerPlaying = playbackState === "playing"
                || playbackState === "buffering";
            if (snapshot.IsPlaying === isPlayerPlaying) {
                if (snapshot.IsPlaying) {
                    isPlaybackUnlockRequired.value = false;
                }
                return;
            }

            if (snapshot.IsPlaying && !isPlayerPlaying) {
                await adapter.play();
                const nextState = await adapter.getPlaybackState();
                isPlaybackUnlockRequired.value = nextState !== "playing"
                    && nextState !== "buffering";
                return;
            }

            await adapter.pause();
            isPlaybackUnlockRequired.value = false;
        });
    }, playbackReconcileIntervalMs);
    const durationTimerId = window.setInterval(() => {
        const snapshot = room.value;
        const adapter = player.value;
        const generation = eventGeneration;
        if (
            disposed
            || duration.value > 0
            || durationRequestPending
            || !snapshot
            || !adapter
        ) {
            return;
        }

        durationRequestPending = true;
        void enqueuePlayerOperation(
            () => updateDuration(adapter, snapshot, generation)
        ).finally(() => {
            durationRequestPending = false;
        });
    }, 1_000);

    /**
     * Обёртка публичных действий: isBusy++, toast при ошибке, isBusy--.
     * После dispose операции игнорируются.
     */
    const runBusy = async (operation: () => Promise<void>): Promise<void> => {
        if (disposed) {
            return;
        }

        busyOperations += 1;
        isBusy.value = true;
        try {
            await operation();
        } catch (error) {
            reportError(error, !(error instanceof WatchRoomValidationError));
        } finally {
            busyOperations -= 1;
            isBusy.value = busyOperations > 0;
        }
    };

    /** Текущий снимок комнаты или ошибка «сначала войдите». */
    const requireCurrentRoom = (): PlaybackSnapshot => {
        if (!room.value) {
            throw new WatchRoomValidationError("Сначала войдите в комнату.");
        }
        return room.value;
    };

    /** Снимок + проверка canControl (owner/moderator + connected). */
    const requireControl = (): PlaybackSnapshot => {
        const snapshot = requireCurrentRoom();
        if (!canControl.value) {
            throw new WatchRoomValidationError(
                "У вас нет прав для управления воспроизведением."
            );
        }
        return snapshot;
    };

    /** Снимок + проверка, что текущий пользователь — owner. */
    const requireOwner = (): PlaybackSnapshot => {
        const snapshot = requireCurrentRoom();
        if (!isOwner.value) {
            throw new WatchRoomValidationError(
                "Это действие доступно только владельцу комнаты."
            );
        }
        return snapshot;
    };

    /**
     * Подключение к Hub (JWT из WatchRoomAuthSession).
     * Alias: connect() делает то же самое.
     */
    const start = (): Promise<void> => runBusy(async () => {
        if (!WatchRoomAuthSession.get()) {
            throw new WatchRoomValidationError(
                "Сессия комнаты истекла или отсутствует. Войдите снова."
            );
        }

        try {
            await service.start();
        } catch (error) {
            if (isWatchRoomUnauthorizedError(error)) {
                WatchRoomAuthSession.clear();
                throw new WatchRoomValidationError(
                    "Сессия комнаты истекла или недействительна. Войдите снова."
                );
            }
            throw error;
        }
    });

    /**
     * Создаёт комнату с VideoUrl (YouTube или AllPlay).
     * UI/плеер обновляются только из PlaybackStateChanged, не из ответа invoke.
     */
    const createRoom = (videoUrl: string): Promise<void> => runBusy(async () => {
        const rawInput = requireText(videoUrl, "Ссылка на видео");
        const resolved = resolveVideoInput(rawInput);
        if (!resolved) {
            throw new WatchRoomValidationError(
                "Укажите корректную ссылку YouTube или embed AllPlay."
            );
        }
        acceptsPlaybackEvents = true;
        try {
            await service.createRoom({ VideoUrl: resolved.url });
            // The invoke result deliberately does not update room or player.
        } catch (error) {
            if (!room.value) {
                acceptsPlaybackEvents = false;
            }
            throw error;
        }
    });

    /**
     * Вход в комнату по RoomId.
     * Состояние ждём из PlaybackStateChanged.
     */
    const joinRoom = (roomId: string): Promise<void> => runBusy(async () => {
        const normalizedRoomId = requireText(roomId, "Идентификатор комнаты");
        acceptsPlaybackEvents = true;
        try {
            await service.joinRoom({ RoomId: normalizedRoomId });
            // The invoke result deliberately does not update room or player.
        } catch (error) {
            if (!room.value) {
                acceptsPlaybackEvents = false;
            }
            throw error;
        }
    });

    /**
     * LeaveRoom на сервере и локальный clearRoomAndPausePlayer
     * (даже если LeaveRoom упал — локально выходим).
     */
    const leaveRoom = (): Promise<void> => runBusy(async () => {
        const snapshot = requireCurrentRoom();
        let leaveFailed = false;
        let leaveError: unknown;

        try {
            await service.leaveRoom({
                RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
            });
        } catch (error) {
            leaveFailed = true;
            leaveError = error;
        } finally {
            await clearRoomAndPausePlayer();
        }

        if (leaveFailed) {
            throw leaveError;
        }
    });

    /** Hub Play от UI-кнопки (owner/mod) с текущей позицией плеера. */
    const play = (): Promise<void> => runBusy(async () => {
        const snapshot = requireControl();
        const adapter = player.value;
        if (!adapter) {
            throw new WatchRoomValidationError("Видеоплеер ещё не готов.");
        }

        const position = requirePosition(await adapter.getCurrentTime());
        const wasLocallyDetached = isLocallyDetached.value;
        isLocallyDetached.value = false;
        if (room.value !== snapshot || !canControl.value) {
            isLocallyDetached.value = wasLocallyDetached;
            throw new WatchRoomValidationError("Состояние комнаты уже изменилось.");
        }
        try {
            await service.play({
                RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                PositionSeconds: position,
            });
        } catch (error) {
            isLocallyDetached.value = wasLocallyDetached;
            throw error;
        }
    });

    /** Hub Pause от UI-кнопки (owner/mod) с текущей позицией плеера. */
    const pause = (): Promise<void> => runBusy(async () => {
        const snapshot = requireControl();
        const adapter = player.value;
        if (!adapter) {
            throw new WatchRoomValidationError("Видеоплеер ещё не готов.");
        }

        const position = requirePosition(await adapter.getCurrentTime());
        const wasLocallyDetached = isLocallyDetached.value;
        isLocallyDetached.value = false;
        if (room.value !== snapshot || !canControl.value) {
            isLocallyDetached.value = wasLocallyDetached;
            throw new WatchRoomValidationError("Состояние комнаты уже изменилось.");
        }
        try {
            await service.pause({
                RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                PositionSeconds: position,
            });
        } catch (error) {
            isLocallyDetached.value = wasLocallyDetached;
            throw error;
        }
    });

    /**
     * Hub Seek от UI (owner/mod).
     * Оптимистично обновляет pendingSeekPosition до прихода снимка.
     */
    const seek = (seconds: number): Promise<void> => runBusy(async () => {
        const snapshot = requireControl();
        const position = requirePosition(seconds);
        const wasLocallyDetached = isLocallyDetached.value;
        isLocallyDetached.value = false;
        pendingSeekPosition.value = position;
        updateDisplayedPosition();

        try {
            await service.seek({
                RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
                PositionSeconds: position,
                IsPlaying: snapshot.IsPlaying,
            });
        } catch (error) {
            isLocallyDetached.value = wasLocallyDetached;
            if (pendingSeekPosition.value === position) {
                pendingSeekPosition.value = null;
                updateDisplayedPosition();
            }
            throw error;
        }
    });

    /** Выйти из OFFLINE и снова применить последний снимок комнаты. */
    const syncToRoom = (): Promise<void> => runBusy(async () => {
        const snapshot = requireCurrentRoom();
        const adapter = player.value;
        if (!adapter) {
            throw new WatchRoomValidationError("Видеоплеер ещё не готов.");
        }

        const generation = eventGeneration;
        const wasLocallyDetached = isLocallyDetached.value;
        isLocallyDetached.value = false;
        try {
            await enqueuePlayerOperation(
                () => applySnapshotToPlayer(snapshot, generation, true),
                true
            );
            isPlaybackUnlockRequired.value = false;
        } catch (error) {
            isLocallyDetached.value = wasLocallyDetached;
            throw error;
        }
    });

    /**
     * Клик по оверлею «Нажмите, чтобы включить видео» —
     * жест пользователя для разблокировки autoplay.
     */
    const unlockPlayback = (): Promise<void> => runBusy(async () => {
        const snapshot = requireCurrentRoom();
        const adapter = player.value;
        if (!adapter) {
            throw new WatchRoomValidationError("Видеоплеер ещё не готов.");
        }

        const generation = eventGeneration;
        isLocallyDetached.value = false;
        await enqueuePlayerOperation(
            () => applySnapshotToPlayer(snapshot, generation, true),
            true
        );
        const playbackState = await adapter.getPlaybackState();
        if (snapshot.IsPlaying && playbackState !== "playing" && playbackState !== "buffering") {
            isPlaybackUnlockRequired.value = true;
            throw new WatchRoomValidationError(
                "Браузер заблокировал автозапуск. Нажмите ещё раз или play в плеере."
            );
        }
        isPlaybackUnlockRequired.value = false;
    });

    /**
     * Флаг «пользователь тянет слайдер» — на время скрабба
     * отключает детектор локальной перемотки.
     */
    const setSeekInteractionActive = (active: boolean): void => {
        seekInteractionActive = active;
    };

    /** Owner: назначить модератора по UserId. */
    const grantModerator = (userId: number): Promise<void> => runBusy(async () => {
        const snapshot = requireOwner();
        await service.grantModerator({
            RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
            UserId: requireUserId(userId),
        });
    });

    /** Owner: снять модератора по UserId. */
    const revokeModerator = (userId: number): Promise<void> => runBusy(async () => {
        const snapshot = requireOwner();
        await service.revokeModerator({
            RoomId: requireText(snapshot.RoomId, "Идентификатор комнаты"),
            UserId: requireUserId(userId),
        });
    });

    /**
     * Размонтирование: отписки, таймеры, LeaveRoom (best-effort),
     * stop Hub, destroy всех наблюдавшихся плееров. Идемпотентен.
     */
    const dispose = (): Promise<void> => {
        if (disposePromise) {
            return disposePromise;
        }

        disposed = true;
        acceptsPlaybackEvents = false;
        seekInteractionActive = false;
        eventGeneration += 1;
        unsubscribePlayback();
        unsubscribeStatus();
        window.clearInterval(positionTimerId);
        window.clearInterval(localModeDetectionTimerId);
        window.clearInterval(playbackReconcileTimerId);
        window.clearInterval(durationTimerId);
        stopPlayerWatch();
        unsubscribePlayerState?.();
        unsubscribePlayerState = null;
        pendingNativeAdminCommand = null;
        if (nativeSeekTimeoutId !== null) {
            window.clearTimeout(nativeSeekTimeoutId);
            nativeSeekTimeoutId = null;
        }

        disposePromise = (async () => {
            await Promise.all(Array.from(activeRejoins));
            await nativeAdminCommandPromise?.catch(() => undefined);

            const snapshot = room.value;
            if (previousStatus === "connected" && snapshot) {
                try {
                    await service.leaveRoom({ RoomId: snapshot.RoomId });
                } catch {
                    // Leaving during teardown is best-effort.
                }
            }

            try {
                await service.stop();
            } catch {
                // Stopping during teardown is best-effort.
            }

            await eventQueue.catch(() => undefined);
            await playerQueue.catch(() => undefined);

            const destroyOperations = Array.from(observedPlayers, async adapter => {
                try {
                    await adapter.destroy();
                } catch {
                    // Every observed adapter is destroyed at most once.
                }
            });
            await Promise.all(destroyOperations);
            observedPlayers.clear();
            room.value = null;
            isLocallyDetached.value = false;
            isPlaybackUnlockRequired.value = false;
            pendingSeekPosition.value = null;
            currentPosition.value = 0;
            duration.value = 0;
        })();

        return disposePromise;
    };

    onBeforeUnmount(() => {
        void dispose();
    });

    return {
        room,
        connectionStatus,
        isBusy,
        isLocallyDetached,
        isPlaybackUnlockRequired,
        canControl,
        isOwner,
        currentPosition,
        displayPosition,
        duration,
        pendingSeekPosition,
        start,
        connect: start,
        createRoom,
        joinRoom,
        leaveRoom,
        play,
        pause,
        seek,
        syncToRoom,
        unlockPlayback,
        setSeekInteractionActive,
        grantModerator,
        revokeModerator,
        dispose,
    };
}

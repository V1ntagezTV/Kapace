/**
 * Контракты SignalR Hub комнаты совместного просмотра.
 *
 * Поля в PascalCase — как приходит JSON с бэкенда.
 * PlaybackSnapshot — единственный источник истины о состоянии комнаты;
 * клиент применяет его к плееру, а не «угадывает» локально.
 */

/** Причина последнего изменения снимка состояния комнаты. */
export type PlaybackChangeReason =
    | "Created"
    | "Joined"
    | "Left"
    | "Play"
    | "Pause"
    | "Seek"
    | "ModeratorGranted"
    | "ModeratorRevoked";

/**
 * Снимок воспроизведения комнаты.
 * PositionSeconds + UpdatedAtUtc + IsPlaying задают «якорь»;
 * фактическую секунду клиент считает через getEffectivePosition().
 */
export type PlaybackSnapshot = {
    RoomId: string;
    VideoUrl: string;
    PositionSeconds: number;
    IsPlaying: boolean;
    /** ISO UTC-время якоря позиции на сервере. */
    UpdatedAtUtc: string;
    /** Монотонная версия; более старые снимки отбрасываются. */
    Version: number;
    Reason: PlaybackChangeReason;
    OwnerUserId: number;
    ModeratorUserIds: number[];
    /** Уникальные участники комнаты, по возрастанию id. */
    ParticipantUserIds: number[];
};

export type CreateRoomPayload = {
    VideoUrl: string;
};

export type JoinRoomPayload = {
    RoomId: string;
};

export type LeaveRoomPayload = {
    RoomId: string;
};

export type PlayPayload = {
    RoomId: string;
    PositionSeconds?: number;
};

export type PausePayload = {
    RoomId: string;
    PositionSeconds: number;
};

export type SeekPayload = {
    RoomId: string;
    PositionSeconds: number;
    IsPlaying?: boolean;
};

export type GrantModeratorPayload = {
    RoomId: string;
    UserId: number;
};

export type RevokeModeratorPayload = {
    RoomId: string;
    UserId: number;
};

/** Статус SignalR-соединения для UI. */
export type WatchRoomConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting";

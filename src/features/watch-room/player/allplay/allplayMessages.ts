/**
 * Разбор исходящих postMessage AllPlay и эвристика seek по скачку time.
 */

export const ALLPLAY_SEEK_THRESHOLD_SEC = 2;

export type AllPlayOutboundEventName = "play" | "pause" | "timeupdate" | string;

export type AllPlayOutboundMessage = {
    event: AllPlayOutboundEventName;
    time: number;
    /** Полный объект сообщения (для отладки сезон/перевод и т.п.). */
    rawRecord?: Record<string, unknown>;
};

export type AllPlayParsedEvent =
    | { type: "play"; time: number; }
    | { type: "pause"; time: number; }
    | { type: "timeupdate"; time: number; }
    | { type: "seek"; time: number; from: number; to: number; };

/** Любой JSON/object payload от iframe (не только play/pause/timeupdate). */
export function decodeAllPlayPayload(data: unknown): unknown {
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }
    return data;
}

export function parseAllPlayMessageData(data: unknown): AllPlayOutboundMessage | null {
    const raw = decodeAllPlayPayload(data);

    if (!raw || typeof raw !== "object") {
        return null;
    }

    const record = raw as Record<string, unknown>;
    if (typeof record.event !== "string") {
        return null;
    }
    if (typeof record.time !== "number" || !Number.isFinite(record.time)) {
        return null;
    }

    return {
        event: record.event,
        time: record.time,
        rawRecord: record,
    };
}

/**
 * Преобразует сырое сообщение + previousTime в одно или несколько логических событий.
 * Seek эмитится при скачке |Δtime| > threshold (в т.ч. на timeupdate/play/pause).
 */
export function interpretAllPlayMessage(
    message: AllPlayOutboundMessage,
    previousTime: number | null,
    seekThresholdSec: number = ALLPLAY_SEEK_THRESHOLD_SEC
): AllPlayParsedEvent[] {
    const events: AllPlayParsedEvent[] = [];
    const { event, time } = message;

    if (
        previousTime !== null
        && Math.abs(time - previousTime) > seekThresholdSec
    ) {
        events.push({
            type: "seek",
            time,
            from: previousTime,
            to: time,
        });
    }

    if (event === "play") {
        events.push({ type: "play", time });
    } else if (event === "pause") {
        events.push({ type: "pause", time });
    } else if (event === "timeupdate") {
        events.push({ type: "timeupdate", time });
    }

    return events;
}

/**
 * Диагностика исходящих postMessage AllPlay.
 * Включить явно: localStorage.setItem("watchRoomAllPlayDebug", "1") и перезагрузить.
 * В development включено по умолчанию.
 * Смотреть: console + window.__allplayDebugDump()
 */

export type AllPlayDebugEntry = {
    at: number;
    origin: string;
    raw: unknown;
    decoded: unknown;
};

const maxEntries = 200;
const storageKey = "watchRoomAllPlayDebug";

declare global {
    interface Window {
        __allplayDebugLog?: AllPlayDebugEntry[];
        __allplayDebugDump?: () => AllPlayDebugEntry[];
    }
}

export function isAllPlayDebugEnabled(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        if (window.localStorage.getItem(storageKey) === "1") {
            return true;
        }
    } catch {
        // ignore
    }
    return process.env.NODE_ENV === "development";
}

export function pushAllPlayDebugLog(entry: AllPlayDebugEntry): void {
    if (typeof window === "undefined") {
        return;
    }

    const log = window.__allplayDebugLog ?? [];
    log.push(entry);
    if (log.length > maxEntries) {
        log.splice(0, log.length - maxEntries);
    }
    window.__allplayDebugLog = log;
    window.__allplayDebugDump = () => [...(window.__allplayDebugLog ?? [])];

    const decoded = entry.decoded;
    const eventName =
        decoded && typeof decoded === "object" && decoded !== null && "event" in decoded
            ? String((decoded as { event: unknown; }).event)
            : null;

    // timeupdate очень частый — только в буфер, без console spam.
    if (eventName === "timeupdate") {
        return;
    }

    // eslint-disable-next-line no-console
    console.info("[AllPlay message]", {
        origin: entry.origin,
        event: eventName,
        decoded,
        raw: entry.raw,
    });
}

/**
 * Сообщения вне play/pause/timeupdate — кандидаты на сезон/серию/перевод.
 */
export function warnUnknownAllPlayMessage(
    origin: string,
    raw: unknown,
    decoded: unknown
): void {
    // eslint-disable-next-line no-console
    console.warn("[AllPlay unknown message — проверь сезон/серию/перевод]", {
        origin,
        decoded,
        raw,
    });
}

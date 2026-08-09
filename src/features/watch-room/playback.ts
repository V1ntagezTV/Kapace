/**
 * Вспомогательные функции воспроизведения и разбора ошибок Hub.
 */
import type { PlaybackSnapshot } from "./types";

export type ParsedHubError = {
    code: string | null;
    message: string;
};

const fallbackHubErrorMessage = "Не удалось выполнить действие в комнате совместного просмотра.";

/** Коды Hub → сообщения для toast (без учёта регистра и разделителей). */
const hubErrorMessages: Record<string, string> = {
    unauthorized: "Для работы с комнатой необходимо авторизоваться.",
    unauthenticated: "Для работы с комнатой необходимо авторизоваться.",
    roomnotfound: "Комната совместного просмотра не найдена.",
    alreadyinroom: "Вы уже находитесь в комнате совместного просмотра.",
    notinroom: "Вы не состоите в этой комнате.",
    notroomowner: "Это действие доступно только владельцу комнаты.",
    notowner: "Это действие доступно только владельцу комнаты.",
    notmoderator: "Для этого действия нужны права модератора.",
    forbidden: "У вас нет прав для выполнения этого действия.",
    invalidvideourl: "Указана некорректная ссылка на видео.",
    invalidposition: "Указана некорректная позиция воспроизведения.",
    usernotfound: "Пользователь не найден.",
    usernotinroom: "Пользователь не состоит в этой комнате.",
    moderatoralreadygranted: "Пользователь уже является модератором.",
    moderatornotgranted: "Пользователь не является модератором.",
    cannotmoderateowner: "Нельзя изменить права владельца комнаты.",
    cannotrevokeowner: "Нельзя снять владельца",
    roomclosed: "Комната совместного просмотра уже закрыта.",
};

/** Приводит код ошибки к ключу словаря (без регистра и разделителей). */
function normalizeHubErrorCode(code: string): string {
    return code.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

/** Достаёт текстовое сообщение из Error / string / { message }. */
function getRawErrorMessage(raw: unknown): string {
    if (raw instanceof Error) {
        return raw.message;
    }

    if (typeof raw === "string") {
        return raw;
    }

    if (raw && typeof raw === "object" && "message" in raw) {
        const message = (raw as { message?: unknown }).message;
        if (typeof message === "string") {
            return message;
        }
    }

    return String(raw ?? "");
}

/**
 * Фактическая позиция видео на клиенте.
 * Сервер хранит якорь; при IsPlaying=true прибавляем прошедшее с UpdatedAtUtc время.
 */
export function getEffectivePosition(
    snapshot: PlaybackSnapshot,
    now: number = Date.now()
): number {
    if (!snapshot.IsPlaying) {
        return snapshot.PositionSeconds;
    }

    const updatedAt = Date.parse(snapshot.UpdatedAtUtc);
    if (!Number.isFinite(updatedAt)) {
        return snapshot.PositionSeconds;
    }

    const elapsedSeconds = Math.max(0, now - updatedAt) / 1000;
    return snapshot.PositionSeconds + elapsedSeconds;
}

/**
 * Можно ли принять кандидат вместо текущего снимка.
 * Равенство версий допустимо: тот же Version может прийти и из invoke, и из события.
 */
export function isSnapshotNewerOrEqual(
    candidate: PlaybackSnapshot,
    current: PlaybackSnapshot | null | undefined
): boolean {
    return !current || candidate.Version >= current.Version;
}

/**
 * Разбор ошибки Hub вида `code:message` или `HubException: code: message`.
 */
export function parseHubError(raw: unknown): ParsedHubError {
    const rawMessage = getRawErrorMessage(raw).trim();
    const message = rawMessage.split(/\r?\n/, 1)[0].trim();
    const hubExceptionMatch = message.match(
        /(?:HubException|HubException`1)\s*:\s*([A-Za-z][A-Za-z0-9_.-]*)\s*:\s*(.*)$/i
    );

    if (hubExceptionMatch) {
        return {
            code: hubExceptionMatch[1],
            message: hubExceptionMatch[2].trim(),
        };
    }

    const parts = message.split(":");
    for (let index = parts.length - 2; index >= 0; index -= 1) {
        const possibleCode = parts[index].trim().replace(/^(?:Error|HubException)\s+/i, "");
        if (hubErrorMessages[normalizeHubErrorCode(possibleCode)]) {
            return {
                code: possibleCode,
                message: parts.slice(index + 1).join(":").trim(),
            };
        }
    }

    const codeMessageMatch = message.match(
        /(?:^|:\s*)([A-Z][A-Z0-9_.-]{2,})\s*:\s*(.*)$/
    );
    if (codeMessageMatch) {
        return {
            code: codeMessageMatch[1],
            message: codeMessageMatch[2].trim(),
        };
    }

    return {
        code: null,
        message,
    };
}

/** Код Hub → готовое русское сообщение для toast (или fallback). */
export function mapHubErrorToRussian(code: string | null | undefined): string {
    if (!code) {
        return fallbackHubErrorMessage;
    }

    return hubErrorMessages[normalizeHubErrorCode(code)] ?? fallbackHubErrorMessage;
}

/** Сообщение для UI по любой ошибке Hub / SignalR. */
export function getHubErrorMessage(raw: unknown): string {
    if (isWatchRoomUnauthorizedError(raw)) {
        return hubErrorMessages.unauthorized;
    }

    return mapHubErrorToRussian(parseHubError(raw).code);
}

/**
 * 401 negotiate / Unauthorized / коды unauthorized|unauthenticated.
 * Cookie-сессия сайта при этом может быть ещё живой — нужен новый Bearer.
 */
export function isWatchRoomUnauthorizedError(raw: unknown): boolean {
    const parsed = parseHubError(raw);
    const normalizedCode = parsed.code
        ? normalizeHubErrorCode(parsed.code)
        : "";
    if (normalizedCode === "unauthorized" || normalizedCode === "unauthenticated") {
        return true;
    }

    const rawMessage = getRawErrorMessage(raw);
    if (/\b401\b/.test(rawMessage) || /unauthorized/i.test(rawMessage)) {
        return true;
    }

    if (raw && typeof raw === "object") {
        const statusCode = (raw as { statusCode?: unknown }).statusCode;
        if (statusCode === 401 || statusCode === "401") {
            return true;
        }
    }

    return false;
}

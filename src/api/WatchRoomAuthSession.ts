/**
 * Сессия Bearer JWT для SignalR Hub комнаты просмотра.
 *
 * Важно: cookie-авторизация сайта и этот JWT — разные вещи.
 * Hub принимает только Bearer из sessionStorage; cookie для negotiate не подходит.
 * Токен выдаётся при login-by-bearer на странице входа и живёт в вкладке браузера.
 */
import type { LoginByBearerResponse } from "@/api/UserApi";

const storageKey = "watch-room-auth-session";
/** Запас до exp, чтобы не слать уже почти протухший токен в negotiate. */
const expirySkewMs = 30_000;

/**
 * Декодирует payload JWT (base64url) без проверки подписи.
 * Нужен только для чтения поля exp на клиенте.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) {
        return null;
    }

    try {
        const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const json = window.atob(padded);
        const payload: unknown = JSON.parse(json);
        if (!payload || typeof payload !== "object") {
            return null;
        }

        return payload as Record<string, unknown>;
    } catch {
        return null;
    }
}

/**
 * Возвращает время истечения токена в миллисекундах (Unix ms)
 * или null, если exp отсутствует / токен не JWT.
 */
function getTokenExpiryMs(token: string): number | null {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
        return null;
    }

    return payload.exp * 1000;
}

/**
 * Проверяет, можно ли ещё использовать токен.
 * Для JWT учитывает exp с запасом expirySkewMs;
 * для opaque-токенов достаточно непустой строки.
 */
function isTokenUsable(token: string, now = Date.now()): boolean {
    const expiryMs = getTokenExpiryMs(token);
    if (expiryMs === null) {
        // Не-JWT / opaque — оставляем до ответа сервера.
        return token.trim().length > 0;
    }

    return expiryMs - expirySkewMs > now;
}

/**
 * Type-guard структуры LoginByBearerResponse
 * (BearerToken + положительный UserId).
 */
function isValidSession(value: unknown): value is LoginByBearerResponse {
    if (!value || typeof value !== "object") {
        return false;
    }

    const session = value as Partial<LoginByBearerResponse>;
    return typeof session.BearerToken === "string"
        && session.BearerToken.trim().length > 0
        && typeof session.UserId === "number"
        && Number.isSafeInteger(session.UserId)
        && session.UserId > 0;
}

/**
 * Возвращает sessionStorage вкладки или null вне браузера / при запрете доступа.
 */
function getStorage(): Storage | null {
    try {
        return typeof window === "undefined" ? null : window.sessionStorage;
    } catch {
        return null;
    }
}

export const WatchRoomAuthSession = {
    /**
     * Читает сессию комнаты из sessionStorage.
     * @returns `{ BearerToken, UserId }` или `null`, если записи нет,
     * данные битые или JWT уже истёк (в этих случаях запись удаляется).
     */
    get(): LoginByBearerResponse | null {
        const storage = getStorage();
        if (!storage) {
            return null;
        }

        try {
            const storedValue = storage.getItem(storageKey);
            if (!storedValue) {
                return null;
            }

            const session: unknown = JSON.parse(storedValue);
            if (!isValidSession(session)) {
                storage.removeItem(storageKey);
                return null;
            }

            if (!isTokenUsable(session.BearerToken)) {
                storage.removeItem(storageKey);
                return null;
            }

            return session;
        } catch {
            try {
                storage.removeItem(storageKey);
            } catch {
                // ignore
            }
            return null;
        }
    },

    /**
     * Сохраняет сессию после успешного login-by-bearer.
     * @returns `true`, если запись удалась; `false` при невалидных данных,
     * истёкшем токене или недоступном storage.
     */
    set(session: LoginByBearerResponse): boolean {
        const storage = getStorage();
        if (!storage || !isValidSession(session) || !isTokenUsable(session.BearerToken)) {
            return false;
        }

        try {
            storage.setItem(storageKey, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Удаляет сессию комнаты (logout, 401 Hub, протухший JWT).
     * Ошибки storage игнорируются.
     */
    clear(): void {
        try {
            getStorage()?.removeItem(storageKey);
        } catch {
            // ignore
        }
    },
};

/**
 * Валидация и нормализация URL AllPlay (Farmedia).
 * Только прямой хост dori.farmedia.live с token_movie.
 */

const allPlayHost = "dori.farmedia.live";

/** Protocol-relative и http(s) → абсолютный https URL или null. */
export function normalizeAllPlayUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const absolute = trimmed.startsWith("//")
        ? `https:${trimmed}`
        : trimmed;

    let url: URL;
    try {
        url = new URL(absolute);
    } catch {
        return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
    }

    if (url.hostname.toLowerCase() !== allPlayHost) {
        return null;
    }

    url.protocol = "https:";
    return url.toString();
}

export function parseAllPlayUrl(value: string): { url: string; } | null {
    const normalized = normalizeAllPlayUrl(value);
    if (!normalized) {
        return null;
    }

    let url: URL;
    try {
        url = new URL(normalized);
    } catch {
        return null;
    }

    const tokenMovie = url.searchParams.get("token_movie")?.trim();
    if (!tokenMovie) {
        return null;
    }

    return { url: normalized };
}

export function isValidAllPlayUrl(value: string): boolean {
    return parseAllPlayUrl(value) !== null;
}

export const ALLPLAY_ORIGIN = "https://dori.farmedia.live";

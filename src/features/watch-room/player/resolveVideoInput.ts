/**
 * Нормализация пользовательского ввода в VideoUrl комнаты:
 * ссылка YouTube / AllPlay или HTML iframe → { kind, url }.
 */
import { isValidAllPlayUrl, normalizeAllPlayUrl } from "./allplay/allplayUrl";
import { isValidYouTubeUrl } from "./youtube/youtubeUrl";

export type WatchVideoKind = "youtube" | "allplay";

export type ResolvedWatchVideo = {
    kind: WatchVideoKind;
    url: string;
};

function extractIframeSrc(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed.toLowerCase().startsWith("<iframe")) {
        return null;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "text/html");
    if (doc.documentElement.querySelector("parsererror")) {
        return null;
    }

    const iframe = doc.getElementsByTagName("iframe")[0];
    const src = iframe?.getAttribute("src")?.trim();
    return src || null;
}

function normalizeCandidate(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }
    return trimmed;
}

/**
 * Разбирает URL или iframe-код. Возвращает нормализованный абсолютный URL
 * и тип плеера, либо null если формат не поддержан.
 */
export function resolveVideoInput(input: string): ResolvedWatchVideo | null {
    const fromIframe = extractIframeSrc(input);
    const candidate = normalizeCandidate(fromIframe ?? input.trim());
    if (!candidate) {
        return null;
    }

    if (isValidYouTubeUrl(candidate)) {
        return { kind: "youtube", url: candidate };
    }

    const allPlayUrl = normalizeAllPlayUrl(candidate);
    if (allPlayUrl && isValidAllPlayUrl(allPlayUrl)) {
        return { kind: "allplay", url: allPlayUrl };
    }

    return null;
}

export function isValidWatchVideoInput(input: string): boolean {
    return resolveVideoInput(input) !== null;
}

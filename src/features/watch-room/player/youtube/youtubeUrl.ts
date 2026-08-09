/**
 * Парсинг и валидация ссылок YouTube для комнаты просмотра.
 * Принимаются только абсолютные http(s)-URL с известными хостами.
 */

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
const absoluteHttpUrlPattern = /^https?:\/\//i;
const youtubeHosts = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
]);

export type ParsedYouTubeUrl = {
    videoId: string;
};

/** videoId из пути `/embed/…` или `/shorts/…`. */
function getPathVideoId(pathname: string, prefix: "embed" | "shorts"): string | null {
    const match = pathname.match(new RegExp(`^/${prefix}/([^/]+)/?$`));
    return match?.[1] ?? null;
}

/**
 * Извлекает 11-символьный videoId из абсолютного URL YouTube
 * (youtu.be, /watch?v=, /embed/, /shorts/) или null, если ссылка некорректна.
 */
export function parseYouTubeUrl(value: string): ParsedYouTubeUrl | null {
    if (value !== value.trim() || !absoluteHttpUrlPattern.test(value)) {
        return null;
    }

    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
    }

    const hostname = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
        const match = url.pathname.match(/^\/([^/]+)\/?$/);
        videoId = match?.[1] ?? null;
    } else if (youtubeHosts.has(hostname)) {
        if (url.pathname === "/watch" || url.pathname === "/watch/") {
            videoId = url.searchParams.get("v");
        } else {
            videoId = getPathVideoId(url.pathname, "embed")
                ?? getPathVideoId(url.pathname, "shorts");
        }
    }

    if (!videoId || !videoIdPattern.test(videoId)) {
        return null;
    }

    return { videoId };
}

/** Только videoId или null. */
export function extractYouTubeVideoId(value: string): string | null {
    return parseYouTubeUrl(value)?.videoId ?? null;
}

/** true, если строка — валидная абсолютная ссылка YouTube. */
export function isValidYouTubeUrl(value: string): boolean {
    return parseYouTubeUrl(value) !== null;
}

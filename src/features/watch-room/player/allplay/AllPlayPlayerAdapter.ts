/**
 * Адаптер AllPlay / AllohaTV (Farmedia) под SyncPlayer.
 *
 * Исходящие события (как у wparty class As):
 *   JSON-строка { event: "play"|"pause"|"timeupdate", time: number }
 *   origin https://dori.farmedia.live
 *
 * Входящие команды (тот же протокол, что у wparty):
 *   postMessage(JSON.stringify({ api: "play" | "pause" }), "*")
 *   postMessage(JSON.stringify({ api: "seek", value: seconds }), "*")
 */
import type {
    SyncPlayer,
    SyncPlayerPlaybackState,
} from "../SyncPlayer";
import {
    ALLPLAY_SEEK_THRESHOLD_SEC,
    decodeAllPlayPayload,
    interpretAllPlayMessage,
    parseAllPlayMessageData,
} from "./allplayMessages";
import {
    isAllPlayDebugEnabled,
    pushAllPlayDebugLog,
    warnUnknownAllPlayMessage,
} from "./allplayDebug";
import {
    ALLPLAY_ORIGIN,
    isValidAllPlayUrl,
    normalizeAllPlayUrl,
} from "./allplayUrl";

const commandTimeoutMs = 1_500;

type PlaybackStateListener = (state: SyncPlayerPlaybackState) => void;

export class AllPlayPlayerAdapter implements SyncPlayer {
    private readonly container: HTMLElement;
    private iframe: HTMLIFrameElement | null = null;
    private destroyed = false;
    private lastTime = 0;
    private previousTimeForSeek: number | null = null;
    private playbackState: SyncPlayerPlaybackState = "cued";
    /** Пока ждём ack программной команды — не шлём native seek в Hub. */
    private programmaticUntil = 0;
    private readonly listeners = new Set<PlaybackStateListener>();
    private readonly onWindowMessage = (event: MessageEvent): void => {
        this.handleWindowMessage(event);
    };

    constructor(container: HTMLElement) {
        this.container = container;
        window.addEventListener("message", this.onWindowMessage);
    }

    supportsProgrammaticPlayback(): boolean {
        return true;
    }

    async load(videoUrl: string): Promise<void> {
        this.ensureNotDestroyed();
        const normalized = normalizeAllPlayUrl(videoUrl);
        if (!normalized || !isValidAllPlayUrl(normalized)) {
            throw new Error("Некорректный URL AllPlay.");
        }

        this.clearIframe();
        this.lastTime = 0;
        this.previousTimeForSeek = null;
        this.setPlaybackState("cued");

        const iframe = document.createElement("iframe");
        iframe.src = normalized;
        iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        iframe.title = "AllPlay видеоплеер";

        this.iframe = iframe;
        this.container.replaceChildren(iframe);

        await new Promise<void>((resolve, reject) => {
            const onLoad = (): void => {
                cleanup();
                resolve();
            };
            const onError = (): void => {
                cleanup();
                reject(new Error("Не удалось загрузить iframe AllPlay."));
            };
            const cleanup = (): void => {
                iframe.removeEventListener("load", onLoad);
                iframe.removeEventListener("error", onError);
            };
            iframe.addEventListener("load", onLoad);
            iframe.addEventListener("error", onError);
        });
    }

    async play(): Promise<void> {
        this.ensureNotDestroyed();
        if (this.playbackState === "playing") {
            return;
        }
        await this.sendApiCommand({ api: "play" }, "playing");
    }

    async pause(): Promise<void> {
        this.ensureNotDestroyed();
        if (this.playbackState === "paused") {
            return;
        }
        await this.sendApiCommand({ api: "pause" }, "paused");
    }

    async seekTo(seconds: number): Promise<void> {
        this.ensureNotDestroyed();
        if (!Number.isFinite(seconds) || seconds < 0) {
            throw new Error("Некорректная позиция seek.");
        }
        if (Math.abs(this.lastTime - seconds) <= ALLPLAY_SEEK_THRESHOLD_SEC) {
            return;
        }

        this.programmaticUntil = Date.now() + commandTimeoutMs;
        this.postApi({ api: "seek", value: seconds });

        await new Promise<void>(resolve => {
            const startedAt = Date.now();
            const pollId = window.setInterval(() => {
                if (Math.abs(this.lastTime - seconds) <= ALLPLAY_SEEK_THRESHOLD_SEC) {
                    window.clearInterval(pollId);
                    resolve();
                    return;
                }
                if (Date.now() - startedAt >= commandTimeoutMs) {
                    window.clearInterval(pollId);
                    // Не подменяем lastTime — иначе Hub решит, что seek прошёл.
                    resolve();
                }
            }, 80);
        });
    }

    async getCurrentTime(): Promise<number> {
        this.ensureNotDestroyed();
        return this.lastTime;
    }

    async getDuration(): Promise<number> {
        this.ensureNotDestroyed();
        return 0;
    }

    async getPlaybackState(): Promise<SyncPlayerPlaybackState | null> {
        this.ensureNotDestroyed();
        return this.playbackState;
    }

    onPlaybackStateChanged(listener: PlaybackStateListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    destroy(): void {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        window.removeEventListener("message", this.onWindowMessage);
        this.listeners.clear();
        this.clearIframe();
    }

    private clearIframe(): void {
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        this.container.replaceChildren();
    }

    private ensureNotDestroyed(): void {
        if (this.destroyed) {
            throw new Error("AllPlayPlayerAdapter уже уничтожен.");
        }
    }

    private setPlaybackState(state: SyncPlayerPlaybackState): void {
        if (this.playbackState === state) {
            return;
        }
        this.playbackState = state;
        for (const listener of this.listeners) {
            listener(state);
        }
    }

    private postApi(payload: Record<string, unknown>): void {
        const target = this.iframe?.contentWindow;
        if (!target) {
            return;
        }
        // Формат wparty Alloha adapter (class As).
        target.postMessage(JSON.stringify(payload), "*");
    }

    private async sendApiCommand(
        payload: Record<string, unknown>,
        expectedState: SyncPlayerPlaybackState
    ): Promise<void> {
        this.programmaticUntil = Date.now() + commandTimeoutMs;
        this.postApi(payload);

        await new Promise<void>(resolve => {
            if (this.playbackState === expectedState) {
                resolve();
                return;
            }

            const timeoutId = window.setTimeout(() => {
                unsubscribe();
                resolve();
            }, commandTimeoutMs);

            const unsubscribe = this.onPlaybackStateChanged(state => {
                if (state === expectedState) {
                    window.clearTimeout(timeoutId);
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    private handleWindowMessage(event: MessageEvent): void {
        if (this.destroyed || !this.iframe) {
            return;
        }
        if (event.origin !== ALLPLAY_ORIGIN) {
            return;
        }
        if (event.source !== this.iframe.contentWindow) {
            return;
        }

        const decoded = decodeAllPlayPayload(event.data);
        if (isAllPlayDebugEnabled()) {
            pushAllPlayDebugLog({
                at: Date.now(),
                origin: event.origin,
                raw: event.data,
                decoded,
            });
        }

        const message = parseAllPlayMessageData(event.data);
        if (!message) {
            // Не play/pause/timeupdate — возможная смена сезона/серии/перевода.
            warnUnknownAllPlayMessage(event.origin, event.data, decoded);
            return;
        }

        // Известный event, но не из тройки play/pause/timeupdate.
        if (
            message.event !== "play"
            && message.event !== "pause"
            && message.event !== "timeupdate"
        ) {
            warnUnknownAllPlayMessage(event.origin, event.data, decoded);
        }

        const programmatic = Date.now() < this.programmaticUntil;
        const interpreted = interpretAllPlayMessage(
            message,
            // Во время программных команд не эмитим fake seek в Hub.
            programmatic ? message.time : this.previousTimeForSeek
        );

        for (const item of interpreted) {
            this.lastTime = item.time;
            if (item.type === "seek" && !programmatic) {
                const resumeState =
                    this.playbackState === "paused" ? "paused" : "playing";
                this.setPlaybackState("buffering");
                this.setPlaybackState(resumeState);
            } else if (item.type === "play") {
                this.setPlaybackState("playing");
            } else if (item.type === "pause") {
                this.setPlaybackState("paused");
            }
        }

        this.previousTimeForSeek = message.time;
        this.lastTime = message.time;
    }
}

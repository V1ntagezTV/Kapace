/**
 * Адаптер YouTube IFrame API под интерфейс SyncPlayer.
 *
 * - controls: 1 — нативная панель доступна всем;
 * - удалённый play() сначала mute(): браузеры блокируют unmuted autoplay без жеста;
 * - play()/pause() ждут соответствующий onStateChange, чтобы useWatchRoom
 *   мог отличать программные события от действий пользователя.
 */
import type {
    SyncPlayer,
    SyncPlayerPlaybackState,
} from "../SyncPlayer";
import { extractYouTubeVideoId } from "./youtubeUrl";

type YouTubePlayer = {
    cueVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoData(): { video_id?: string; };
    destroy(): void;
};

type YouTubePlayerEvent = {
    target: YouTubePlayer;
};

type YouTubePlayerStateEvent = YouTubePlayerEvent & {
    data: number;
};

type YouTubePlayerErrorEvent = YouTubePlayerEvent & {
    data: number;
};

type YouTubePlayerOptions = {
    playerVars: {
        controls: 1;
        disablekb: 0;
        rel: 0;
        playsinline: 1;
        origin?: string;
    };
    events: {
        onReady(event: YouTubePlayerEvent): void;
        onStateChange(event: YouTubePlayerStateEvent): void;
        onError(event: YouTubePlayerErrorEvent): void;
    };
};

type ActiveLoad = {
    videoId: string;
    generation: number;
    timeoutId: number;
    resolve(): void;
    reject(error: Error): void;
};

type PlaybackStateWaiter = {
    state: SyncPlayerPlaybackState;
    timeoutId: number;
    resolve(): void;
};

type YouTubeIframeApi = {
    Player: new (
        container: HTMLElement | string,
        options: YouTubePlayerOptions
    ) => YouTubePlayer;
};

declare global {
    interface Window {
        YT?: YouTubeIframeApi;
        onYouTubeIframeAPIReady?: () => void;
    }
}

const iframeApiUrl = "https://www.youtube.com/iframe_api";
const apiLoadTimeoutMs = 15_000;
const playerReadyTimeoutMs = 15_000;
const videoCueTimeoutMs = 15_000;
const playbackStateTimeoutMs = 2_000;
const apiLoadAttempts = 2;
const apiRetryDelayMs = 750;
const endedPlayerState = 0;
const playingPlayerState = 1;
const pausedPlayerState = 2;
const bufferingPlayerState = 3;
const cuedPlayerState = 5;

let iframeApiPromise: Promise<YouTubeIframeApi> | null = null;

/** true, если window.YT.Player уже доступен (скрипт iframe_api загружен). */
function getLoadedApi(): YouTubeIframeApi | null {
    return typeof window !== "undefined" && typeof window.YT?.Player === "function"
        ? window.YT
        : null;
}

/** Ищет уже вставленный в DOM script iframe_api. */
function findIframeApiScript(): HTMLScriptElement | null {
    const scripts = Array.from(document.getElementsByTagName("script"));
    return scripts.find(script => script.src === iframeApiUrl) ?? null;
}

/**
 * Загружает https://www.youtube.com/iframe_api один раз на страницу.
 * Повторные вызовы переиспользуют общий Promise; при ошибке Promise сбрасывается.
 */
function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
    const loadedApi = getLoadedApi();
    if (loadedApi) {
        return Promise.resolve(loadedApi);
    }

    if (iframeApiPromise) {
        return iframeApiPromise;
    }

    const pendingPromise = new Promise<YouTubeIframeApi>((resolve, reject) => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            reject(new Error("YouTube iframe API доступен только в браузере."));
            return;
        }

        const previousReadyCallback = window.onYouTubeIframeAPIReady;
        let settled = false;
        let script = findIframeApiScript();

        const cleanup = (): void => {
            window.clearTimeout(timeoutId);
            window.clearInterval(pollId);
            script?.removeEventListener("error", handleScriptError);

            if (window.onYouTubeIframeAPIReady === handleApiReady) {
                window.onYouTubeIframeAPIReady = previousReadyCallback;
            }
        };

        const resolveIfReady = (): boolean => {
            const api = getLoadedApi();
            if (!api || settled) {
                return false;
            }

            settled = true;
            cleanup();
            resolve(api);
            return true;
        };

        const fail = (error: Error): void => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            script?.remove();
            reject(error);
        };

        /** Callback window.onYouTubeIframeAPIReady (+ предыдущий, если был). */
        function handleApiReady(): void {
            try {
                previousReadyCallback?.call(window);
            } finally {
                resolveIfReady();
            }
        }

        /** onerror у script-тега iframe_api. */
        function handleScriptError(): void {
            fail(new Error("Не удалось загрузить YouTube iframe API."));
        }

        window.onYouTubeIframeAPIReady = handleApiReady;

        const timeoutId = window.setTimeout(() => {
            fail(new Error("Превышено время ожидания YouTube iframe API."));
        }, apiLoadTimeoutMs);
        const pollId = window.setInterval(resolveIfReady, 500);

        if (!script) {
            script = document.createElement("script");
            script.src = iframeApiUrl;
            script.async = true;
            document.head.appendChild(script);
        }

        script.addEventListener("error", handleScriptError);
        resolveIfReady();
    });

    iframeApiPromise = pendingPromise;
    pendingPromise.catch(() => {
        if (iframeApiPromise === pendingPromise) {
            iframeApiPromise = null;
        }
    });

    return pendingPromise;
}

export class YouTubePlayerAdapter implements SyncPlayer {
    private player: YouTubePlayer | null = null;
    private readonly playerReadyPromise: Promise<YouTubePlayer>;
    private rejectPlayerReady: ((error: Error) => void) | null = null;
    private activeLoad: ActiveLoad | null = null;
    /** Сериализация последовательных load(), чтобы cue не гонялись. */
    private loadQueue: Promise<void> = Promise.resolve();
    private generation = 0;
    private hasCuedVideo = false;
    private destroyed = false;
    private readonly playbackStateListeners = new Set<
        (state: SyncPlayerPlaybackState) => void
    >();
    /** Ожидатели программных play/pause до прихода нужного onStateChange. */
    private readonly playbackStateWaiters = new Set<PlaybackStateWaiter>();

    /**
     * @param container DOM-элемент или его id, куда IFrame API встроит плеер.
     * Инициализация API и Player стартует сразу в конструкторе.
     */
    public constructor(private readonly container: HTMLElement | string) {
        this.playerReadyPromise = this.initializePlayerWithRetry();
        this.playerReadyPromise.catch(() => undefined);
    }

    /**
     * Готовит ролик по URL (cueVideoById) и ждёт состояния CUED.
     * Вызовы сериализуются через loadQueue.
     */
    public load(videoUrl: string): Promise<void> {
        const videoId = extractYouTubeVideoId(videoUrl);
        if (!videoId) {
            return Promise.reject(new Error("Указана некорректная ссылка YouTube."));
        }

        try {
            this.assertNotDestroyed();
        } catch (error) {
            return Promise.reject(error);
        }

        const operation = this.loadQueue
            .catch(() => undefined)
            .then(async () => {
                const player = await this.getReadyPlayer();
                const generation = this.generation;
                await this.cueVideo(player, videoId, generation);
            });

        this.loadQueue = operation;
        return operation;
    }

    /**
     * Запускает воспроизведение.
     * Перед playVideo() включает mute — иначе Chrome/Vivaldi часто блокируют autoplay.
     * Ждёт onStateChange=playing (или таймаут).
     */
    public async play(): Promise<void> {
        const player = await this.getCuedPlayer();
        if (player.getPlayerState() === playingPlayerState) {
            return;
        }

        // Chrome/Vivaldi блокируют unmuted autoplay без жеста пользователя.
        // Для sync комнаты оставляем muted; звук пользователь включает в UI YouTube.
        try {
            player.mute();
        } catch {
            // Best-effort autoplay unlock.
        }

        await this.executePlaybackStateCommand(
            "playing",
            () => player.playVideo()
        );
    }

    public supportsProgrammaticPlayback(): boolean {
        return true;
    }

    /**
     * Ставит на паузу, если плеер ещё не в paused/cued/ended.
     * Ждёт onStateChange=paused (или таймаут).
     */
    public async pause(): Promise<void> {
        const player = await this.getReadyPlayer();
        const state = player.getPlayerState();
        if (
            state === pausedPlayerState
            || state === cuedPlayerState
            || state === endedPlayerState
        ) {
            return;
        }
        await this.executePlaybackStateCommand(
            "paused",
            () => player.pauseVideo()
        );
    }

    /**
     * Перематывает на секунду `seconds` (allowSeekAhead=true).
     * Не ждёт отдельного seek-события — у IFrame API его нет.
     */
    public async seekTo(seconds: number): Promise<void> {
        if (!Number.isFinite(seconds) || seconds < 0) {
            throw new Error("Позиция воспроизведения должна быть конечным неотрицательным числом.");
        }

        const player = await this.getCuedPlayer();
        player.seekTo(seconds, true);
    }

    /** Текущая позиция ролика в секундах. */
    public async getCurrentTime(): Promise<number> {
        const player = await this.getReadyPlayer();
        const currentTime = player.getCurrentTime();

        if (!Number.isFinite(currentTime) || currentTime < 0) {
            throw new Error("YouTube player вернул некорректную позицию воспроизведения.");
        }

        return currentTime;
    }

    /** Длительность текущего ролика; требует успешного load/cue. */
    public async getDuration(): Promise<number> {
        const player = await this.getCuedPlayer();
        const duration = player.getDuration();

        if (!Number.isFinite(duration) || duration < 0) {
            throw new Error("YouTube player вернул некорректную длительность видео.");
        }

        return duration;
    }

    /** Текущее нормализованное состояние IFrame API. */
    public async getPlaybackState(): Promise<SyncPlayerPlaybackState | null> {
        const player = await this.getReadyPlayer();
        return this.mapPlaybackState(player.getPlayerState());
    }

    /**
     * Подписка на playing/paused/buffering/ended/cued.
     * @returns функция отписки
     */
    public onPlaybackStateChanged(
        listener: (state: SyncPlayerPlaybackState) => void
    ): () => void {
        this.assertNotDestroyed();
        this.playbackStateListeners.add(listener);

        return () => {
            this.playbackStateListeners.delete(listener);
        };
    }

    /**
     * Уничтожает YT.Player, сбрасывает очереди и слушателей.
     * Идемпотентен: повторный вызов ничего не делает.
     */
    public destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.generation += 1;
        this.hasCuedVideo = false;
        this.playbackStateListeners.clear();
        this.playbackStateWaiters.forEach(waiter => {
            window.clearTimeout(waiter.timeoutId);
            waiter.resolve();
        });
        this.playbackStateWaiters.clear();
        this.rejectActiveLoad(new Error("YouTube player уже уничтожен."));
        this.rejectPlayerReady?.(new Error("YouTube player уже уничтожен."));
        this.rejectPlayerReady = null;

        if (this.player) {
            try {
                this.player.destroy();
            } catch {
                // Destruction is best-effort and remains idempotent.
            } finally {
                this.player = null;
            }
        }
    }

    /** Несколько попыток initializePlayer при сбое загрузки API/сети. */
    private async initializePlayerWithRetry(): Promise<YouTubePlayer> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= apiLoadAttempts; attempt += 1) {
            try {
                return await this.initializePlayer();
            } catch (error) {
                lastError = error;
                this.assertNotDestroyed();
                if (attempt < apiLoadAttempts) {
                    await new Promise<void>(resolve => {
                        window.setTimeout(resolve, apiRetryDelayMs);
                    });
                }
            }
        }

        const details = lastError instanceof Error ? ` ${lastError.message}` : "";
        throw new Error(
            `Не удалось загрузить YouTube IFrame API.${details} `
            + "Проверьте доступ к youtube.com, VPN и блокировщики рекламы."
        );
    }

    /**
     * Создаёт YT.Player в container и резолвится на onReady.
     * Навешивает onStateChange / onError.
     */
    private async initializePlayer(): Promise<YouTubePlayer> {
        const api = await loadYouTubeIframeApi();
        this.assertNotDestroyed();

        return new Promise<YouTubePlayer>((resolve, reject) => {
            let settled = false;

            const cleanup = (): void => {
                window.clearTimeout(timeoutId);
                this.rejectPlayerReady = null;
            };

            const succeed = (player: YouTubePlayer): void => {
                if (settled) {
                    return;
                }

                settled = true;
                cleanup();
                resolve(player);
            };

            const fail = (error: Error): void => {
                if (settled) {
                    return;
                }

                settled = true;
                cleanup();
                if (this.player) {
                    try {
                        this.player.destroy();
                    } catch {
                        // Preserve the original readiness error.
                    } finally {
                        this.player = null;
                    }
                }
                reject(error);
            };

            const timeoutId = window.setTimeout(() => {
                fail(new Error("Превышено время ожидания готовности YouTube player."));
            }, playerReadyTimeoutMs);
            this.rejectPlayerReady = fail;

            try {
                this.player = new api.Player(this.container, {
                    playerVars: {
                        controls: 1,
                        disablekb: 0,
                        rel: 0,
                        playsinline: 1,
                        ...this.getOriginPlayerVar(),
                    },
                    events: {
                        onReady: event => succeed(event.target),
                        onStateChange: event => this.handlePlayerStateChange(event),
                        onError: event => {
                            const error = new Error(
                                `YouTube player сообщил об ошибке ${event.data}.`
                            );
                            if (settled) {
                                this.rejectActiveLoad(error);
                            } else {
                                fail(error);
                            }
                        },
                    },
                });
            } catch (error) {
                fail(error instanceof Error
                    ? error
                    : new Error("Не удалось создать YouTube player."));
            }
        });
    }

    /**
     * cueVideoById и ожидание CUED для нужного videoId и generation.
     * Отмена через смену generation / destroy отклоняет Promise.
     */
    private cueVideo(
        player: YouTubePlayer,
        videoId: string,
        generation: number
    ): Promise<void> {
        this.assertGeneration(generation);
        this.hasCuedVideo = false;

        return new Promise<void>((resolve, reject) => {
            const waiter: ActiveLoad = {
                videoId,
                generation,
                timeoutId: 0,
                resolve,
                reject,
            };

            waiter.timeoutId = window.setTimeout(() => {
                this.settleActiveLoad(
                    waiter,
                    new Error("Превышено время ожидания подготовки видео YouTube.")
                );
            }, videoCueTimeoutMs);
            this.activeLoad = waiter;

            try {
                this.assertGeneration(generation);
                player.cueVideoById(videoId);
            } catch (error) {
                this.settleActiveLoad(
                    waiter,
                    error instanceof Error
                        ? error
                        : new Error("Не удалось подготовить видео YouTube.")
                );
            }
        });
    }

    /**
     * Обработчик onStateChange:
     * завершает активный load при CUED, уведомляет listeners,
     * резолвит waiters программных play/pause.
     */
    private handlePlayerStateChange(event: YouTubePlayerStateEvent): void {
        const waiter = this.activeLoad;
        if (waiter && event.data === cuedPlayerState) {
            let currentVideoId: string | undefined;
            try {
                currentVideoId = event.target.getVideoData().video_id;
            } catch {
                currentVideoId = undefined;
            }

            if (
                currentVideoId === waiter.videoId
                && waiter.generation === this.generation
                && !this.destroyed
            ) {
                this.settleActiveLoad(waiter);
            }
        }

        const playbackState = this.mapPlaybackState(event.data);
        if (!playbackState || this.destroyed) {
            return;
        }

        this.playbackStateListeners.forEach(listener => {
            try {
                listener(playbackState);
            } catch {
                // A consumer must not break YouTube's event pipeline.
            }
        });
        this.settlePlaybackStateWaiters(playbackState);
    }

    /**
     * Выполнить playVideo/pauseVideo и дождаться целевого состояния
     * (или таймаута — браузер мог заблокировать autoplay).
     */
    private executePlaybackStateCommand(
        state: SyncPlayerPlaybackState,
        command: () => void
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const waiter: PlaybackStateWaiter = {
                state,
                timeoutId: 0,
                resolve,
            };
            waiter.timeoutId = window.setTimeout(() => {
                this.playbackStateWaiters.delete(waiter);
                resolve();
            }, playbackStateTimeoutMs);
            this.playbackStateWaiters.add(waiter);

            try {
                command();
            } catch (error) {
                window.clearTimeout(waiter.timeoutId);
                this.playbackStateWaiters.delete(waiter);
                reject(error);
            }
        });
    }

    /** Резолвит waiters, ожидающие именно это состояние play/pause. */
    private settlePlaybackStateWaiters(state: SyncPlayerPlaybackState): void {
        this.playbackStateWaiters.forEach(waiter => {
            if (waiter.state !== state) {
                return;
            }

            window.clearTimeout(waiter.timeoutId);
            this.playbackStateWaiters.delete(waiter);
            waiter.resolve();
        });
    }

    /** Числовой код YT.PlayerState → SyncPlayerPlaybackState (или null). */
    private mapPlaybackState(value: number): SyncPlayerPlaybackState | null {
        switch (value) {
            case endedPlayerState:
                return "ended";
            case playingPlayerState:
                return "playing";
            case pausedPlayerState:
                return "paused";
            case bufferingPlayerState:
                return "buffering";
            case cuedPlayerState:
                return "cued";
            default:
                return null;
        }
    }

    /** Отклоняет текущий pending load, если он есть. */
    private rejectActiveLoad(error: Error): void {
        const waiter = this.activeLoad;
        if (waiter) {
            this.settleActiveLoad(waiter, error);
        }
    }

    /**
     * Завершает activeLoad успехом или ошибкой и выставляет hasCuedVideo.
     * Игнорирует чужие waiter'ы (гонка поколений).
     */
    private settleActiveLoad(waiter: ActiveLoad, error?: Error): void {
        if (this.activeLoad !== waiter) {
            return;
        }

        window.clearTimeout(waiter.timeoutId);
        this.activeLoad = null;

        if (error) {
            this.hasCuedVideo = false;
            waiter.reject(error);
            return;
        }

        this.hasCuedVideo = true;
        waiter.resolve();
    }

    /** Дожидается onReady плеера; бросает, если уже destroy. */
    private async getReadyPlayer(): Promise<YouTubePlayer> {
        this.assertNotDestroyed();
        const player = await this.playerReadyPromise;
        this.assertNotDestroyed();
        return player;
    }

    /** Плеер после успешного load/cue; иначе ошибка «видео не подготовлено». */
    private async getCuedPlayer(): Promise<YouTubePlayer> {
        const pendingLoads = this.loadQueue;
        await pendingLoads;
        const player = await this.getReadyPlayer();

        if (!this.hasCuedVideo) {
            throw new Error("Видео YouTube ещё не подготовлено к воспроизведению.");
        }

        return player;
    }

    /** Проверяет, что операция относится к текущему generation и плеер жив. */
    private assertGeneration(generation: number): void {
        this.assertNotDestroyed();
        if (generation !== this.generation) {
            throw new Error("Операция YouTube player была отменена.");
        }
    }

    /** @throws если вызван после destroy(). */
    private assertNotDestroyed(): void {
        if (this.destroyed) {
            throw new Error("YouTube player уже уничтожен.");
        }
    }

    /**
     * playerVars.origin для http(s)-origin страницы
     * (на file:// origin не передаём).
     */
    private getOriginPlayerVar(): { origin?: string } {
        return /^https?:\/\//.test(window.location.origin)
            ? { origin: window.location.origin }
            : {};
    }
}

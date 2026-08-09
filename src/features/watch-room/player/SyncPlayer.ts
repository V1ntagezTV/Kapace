/**
 * Общий контракт видеоплеера для синхронизации комнаты.
 * Реализации: YouTube IFrame API, AllPlay (Farmedia); фабрика — createSyncPlayer.
 */

/** Нормализованные состояния плеера (не путать с Reason снимка комнаты). */
export type SyncPlayerPlaybackState =
    | "playing"
    | "paused"
    | "buffering"
    | "ended"
    | "cued";

export interface SyncPlayer {
    /**
     * Загрузить / подготовить ролик по абсолютному URL провайдера.
     * Не обязан сразу запускать воспроизведение.
     */
    load(videoUrl: string): Promise<void>;

    /** Запустить воспроизведение текущего ролика. */
    play(): Promise<void>;

    /** Поставить текущий ролик на паузу. */
    pause(): Promise<void>;

    /**
     * Перемотать на указанную секунду от начала ролика.
     * @param seconds неотрицательная конечная позиция в секундах
     */
    seekTo(seconds: number): Promise<void>;

    /** Текущая позиция воспроизведения в секундах. */
    getCurrentTime(): Promise<number>;

    /** Длительность ролика в секундах (после успешного load). */
    getDuration(): Promise<number>;

    /**
     * Текущее состояние плеера или null, если API вернуло неизвестный код.
     */
    getPlaybackState(): Promise<SyncPlayerPlaybackState | null>;

    /**
     * Подписка на смену состояния плеера (playing/paused/…).
     * @returns функция отписки
     */
    onPlaybackStateChanged(
        listener: (state: SyncPlayerPlaybackState) => void
    ): () => void;

    /**
     * false — Hub→плеер play/pause/seek недоступны (только исходящие события),
     * applySnapshot не должен форсить воспроизведение и unlock-оверлей.
     */
    supportsProgrammaticPlayback(): boolean;

    /** Уничтожить плеер и освободить ресурсы; повторные вызовы безопасны. */
    destroy(): void | Promise<void>;
}

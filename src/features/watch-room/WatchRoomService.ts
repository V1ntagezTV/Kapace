/**
 * Клиент SignalR Hub `/hubs/watch-room`.
 *
 * - JWT передаётся через accessTokenFactory (без префикса "Bearer ").
 * - Событие PlaybackStateChanged — входящий поток состояния комнаты.
 * - Методы CreateRoom / JoinRoom / Play / Pause / Seek / … вызываются через invoke.
 */
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from "@microsoft/signalr";
import { WatchRoomAuthSession } from "@/api/WatchRoomAuthSession";
import type {
    CreateRoomPayload,
    GrantModeratorPayload,
    JoinRoomPayload,
    LeaveRoomPayload,
    PausePayload,
    PlaybackSnapshot,
    PlayPayload,
    RevokeModeratorPayload,
    SeekPayload,
    WatchRoomConnectionStatus,
} from "./types";

const defaultHubUrl = "http://localhost:5001/hubs/watch-room";
const hubPath = "/hubs/watch-room";
const playbackEventName = "PlaybackStateChanged";

type PlaybackListener = (snapshot: PlaybackSnapshot) => void;
type ConnectionStatusListener = (status: WatchRoomConnectionStatus) => void;

/**
 * Берёт Bearer из WatchRoomAuthSession.
 * @throws если токена нет или он протух (negotiate без JWT даст 401).
 */
function requireBearerToken(): string {
    const token = WatchRoomAuthSession.get()?.BearerToken.trim();
    if (!token) {
        throw new Error("Для подключения к комнате совместного просмотра необходимо авторизоваться.");
    }

    return token;
}

/**
 * Нормализует VUE_APP_SIGNALR_HUB_URL до полного URL хаба.
 * Допускает и базовый host:port, и уже полный путь …/hubs/watch-room.
 */
export function resolveWatchRoomHubUrl(
    configuredUrl: string | undefined = process.env.VUE_APP_SIGNALR_HUB_URL
): string {
    const value = configuredUrl?.trim();
    if (!value) {
        return defaultHubUrl;
    }

    try {
        const url = new URL(value);
        const normalizedPath = url.pathname.replace(/\/+$/, "");
        if (normalizedPath.toLowerCase().endsWith(hubPath)) {
            url.pathname = normalizedPath;
            return url.toString().replace(/\/$/, "");
        }

        url.pathname = `${normalizedPath}${hubPath}`;
        return url.toString().replace(/\/$/, "");
    } catch {
        const withoutTrailingSlash = value.replace(/\/+$/, "");
        if (withoutTrailingSlash.toLowerCase().endsWith(hubPath)) {
            return withoutTrailingSlash;
        }

        return `${withoutTrailingSlash}${hubPath}`;
    }
}

export class WatchRoomService {
    private connection: HubConnection | null = null;
    private startPromise: Promise<void> | null = null;
    private stopPromise: Promise<void> | null = null;
    private status: WatchRoomConnectionStatus = "disconnected";
    private readonly playbackListeners = new Set<PlaybackListener>();
    private readonly statusListeners = new Set<ConnectionStatusListener>();

    /**
     * Устанавливает SignalR-соединение с автопереподключением.
     * Идемпотентен: при уже Connected сразу возвращается;
     * параллельные вызовы ждут один и тот же startPromise.
     */
    public async start(): Promise<void> {
        requireBearerToken();

        if (this.stopPromise) {
            await this.stopPromise;
        }

        const connection = this.getOrCreateConnection();
        if (connection.state === HubConnectionState.Connected) {
            this.setStatus("connected");
            return;
        }

        if (connection.state === HubConnectionState.Reconnecting) {
            this.setStatus("reconnecting");
            return;
        }

        if (this.startPromise) {
            return this.startPromise;
        }

        if (connection.state !== HubConnectionState.Disconnected) {
            throw new Error("Подключение к комнате уже изменяет состояние.");
        }

        this.setStatus("connecting");
        this.startPromise = connection.start()
            .then(() => {
                this.setStatus("connected");
            })
            .catch((error: unknown) => {
                this.setStatus("disconnected");
                throw error;
            })
            .finally(() => {
                this.startPromise = null;
            });

        return this.startPromise;
    }

    /**
     * Корректно останавливает Hub-соединение и переводит статус в disconnected.
     * Дожидается незавершённого start(), если он ещё идёт.
     */
    public async stop(): Promise<void> {
        if (this.stopPromise) {
            return this.stopPromise;
        }

        const connection = this.connection;
        if (!connection) {
            this.setStatus("disconnected");
            return;
        }

        this.stopPromise = (async () => {
            if (this.startPromise) {
                try {
                    await this.startPromise;
                } catch {
                    // A failed start already leaves the connection disconnected.
                }
            }

            if (connection.state !== HubConnectionState.Disconnected) {
                await connection.stop();
            }

            this.setStatus("disconnected");
        })().finally(() => {
            this.stopPromise = null;
        });

        return this.stopPromise;
    }

    /**
     * Создаёт комнату с указанным VideoUrl.
     * Итоговое состояние комнаты придёт событием PlaybackStateChanged —
     * результат invoke сам по себе UI не обновляет.
     */
    public createRoom(payload: CreateRoomPayload): Promise<PlaybackSnapshot> {
        return this.invoke("CreateRoom", payload);
    }

    /**
     * Входит в существующую комнату по RoomId.
     * Актуальный снимок нужно ждать из PlaybackStateChanged.
     */
    public joinRoom(payload: JoinRoomPayload): Promise<PlaybackSnapshot> {
        return this.invoke("JoinRoom", payload);
    }

    /** Покидает комнату на сервере (без возврата снимка). */
    public leaveRoom(payload: LeaveRoomPayload): Promise<void> {
        return this.invokeVoid("LeaveRoom", payload);
    }

    /** Команда Play для комнаты (owner / moderator). */
    public play(payload: PlayPayload): Promise<PlaybackSnapshot> {
        return this.invoke("Play", payload);
    }

    /** Команда Pause для комнаты (owner / moderator). */
    public pause(payload: PausePayload): Promise<PlaybackSnapshot> {
        return this.invoke("Pause", payload);
    }

    /** Команда Seek на PositionSeconds (owner / moderator). */
    public seek(payload: SeekPayload): Promise<PlaybackSnapshot> {
        return this.invoke("Seek", payload);
    }

    /** Назначает модератора (только owner). */
    public grantModerator(payload: GrantModeratorPayload): Promise<PlaybackSnapshot> {
        return this.invoke("GrantModerator", payload);
    }

    /** Снимает модератора (только owner). */
    public revokeModerator(payload: RevokeModeratorPayload): Promise<PlaybackSnapshot> {
        return this.invoke("RevokeModerator", payload);
    }

    /**
     * Подписка на PlaybackStateChanged — единый поток состояния комнаты.
     * @returns функция отписки
     */
    public onPlaybackStateChanged(listener: PlaybackListener): () => void {
        this.playbackListeners.add(listener);
        this.connection?.on(playbackEventName, listener);

        return () => {
            this.playbackListeners.delete(listener);
            this.connection?.off(playbackEventName, listener);
        };
    }

    /**
     * Подписка на смену статуса соединения; сразу вызывает listener текущим статусом.
     * @returns функция отписки
     */
    public subscribeConnectionStatus(listener: ConnectionStatusListener): () => void {
        this.statusListeners.add(listener);
        listener(this.status);

        return () => {
            this.statusListeners.delete(listener);
        };
    }

    /**
     * Лениво создаёт HubConnection с JWT и withAutomaticReconnect,
     * либо возвращает уже созданный экземпляр.
     */
    private getOrCreateConnection(): HubConnection {
        if (this.connection) {
            return this.connection;
        }

        requireBearerToken();
        // accessTokenFactory вызывается при каждом negotiate/reconnect —
        // токен читается заново из WatchRoomAuthSession.
        const connection = new HubConnectionBuilder()
            .withUrl(resolveWatchRoomHubUrl(), {
                accessTokenFactory: () => requireBearerToken(),
            })
            .withAutomaticReconnect()
            .build();

        connection.onreconnecting(() => {
            this.setStatus("reconnecting");
        });
        connection.onreconnected(() => {
            this.setStatus("connected");
        });
        connection.onclose(() => {
            this.setStatus("disconnected");
        });

        this.playbackListeners.forEach(listener => {
            connection.on(playbackEventName, listener);
        });

        this.connection = connection;
        return connection;
    }

    /** invoke Hub-метода, возвращающего PlaybackSnapshot. */
    private invoke<TPayload>(methodName: string, payload: TPayload): Promise<PlaybackSnapshot> {
        return this.getConnectedConnection().invoke<PlaybackSnapshot>(methodName, payload);
    }

    /** invoke Hub-метода без полезной нагрузки в ответе (LeaveRoom). */
    private invokeVoid<TPayload>(methodName: string, payload: TPayload): Promise<void> {
        return this.getConnectedConnection().invoke<void>(methodName, payload);
    }

    /**
     * Гарантирует Connected-состояние перед invoke.
     * @throws если соединение отсутствует или не Connected
     */
    private getConnectedConnection(): HubConnection {
        requireBearerToken();

        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error("Нет активного подключения к комнате совместного просмотра.");
        }

        return this.connection;
    }

    /** Обновляет статус и уведомляет подписчиков (без дублей при том же значении). */
    private setStatus(status: WatchRoomConnectionStatus): void {
        if (this.status === status) {
            return;
        }

        this.status = status;
        this.statusListeners.forEach(listener => listener(status));
    }
}

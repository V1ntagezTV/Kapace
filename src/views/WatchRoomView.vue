<!--
  Страница /watch-room (лобби) и /watch-room/:room (deep-link в комнату).
  Синхронизация и Hub — в useWatchRoom; здесь UI, маршрут и жизненный цикл плеера.
-->
<template>
  <main class="watch-room-view">
    <LobbyForm
      v-if="!room"
      :connected="isConnected"
      :busy="isBusy"
      :connection-label="connectionLabel"
      @create="create"
      @join="join"
    />

    <section
      v-show="room"
      class="watch-room-view__room gap-16"
      aria-label="Комната совместного просмотра"
    >
      <div class="watch-room-view__main-column">
        <div class="watch-room-view__player-shell">
          <!-- Контейнер плеера комнаты (YouTube / AllPlay). -->
          <div
            ref="playerContainer"
            class="watch-room-view__player"
            aria-label="Видеоплеер комнаты"
          />
          <!--
            Оверлей при блокировке autoplay браузером (YouTube).
            Клик = жест пользователя → unlockPlayback().
          -->
          <button
            v-if="room && isPlaybackUnlockRequired && !isLocallyDetached"
            class="watch-room-view__unlock"
            type="button"
            :disabled="isBusy || !isConnected"
            @click="unlockPlayback"
          >
            Нажмите, чтобы включить видео
          </button>
        </div>

        <PlaybackControls
          v-if="room"
          :can-control="canControl"
          :is-locally-detached="isLocallyDetached"
          :is-playing="room.IsPlaying"
          :position="displayPosition"
          :duration="duration"
          :busy="isBusy"
          :connected="isConnected"
          :viewer-count="viewerCount"
          @play="play"
          @pause="pause"
          @seek="seek"
          @sync="syncToRoom"
          @seek-interaction="setSeekInteractionActive"
        />
      </div>

      <aside
        v-if="room"
        class="watch-room-view__sidebar"
        aria-label="Сведения и зрители комнаты"
      >
        <div class="watch-room-view__sidebar-top">
          <RoomInfo
            :room="room"
            :connected="isConnected"
            :connection-label="connectionLabel"
            :busy="isBusy"
            @copy="copyRoomId"
            @leave="leaveRoom"
          />
        </div>
        <WatchRoomSidePanel class="watch-room-view__viewers">
          <template #chat>
            <RoomChatPanel
              :events="activityEvents"
              :nickname-by-user-id="nicknameByUserId"
            />
          </template>
          <template #viewers>
            <ViewersPanel
              embedded
              :show-header="false"
              :viewers="viewers"
              :loading="viewersLoading"
              :is-owner="isOwner"
              :busy="isBusy"
              :connected="isConnected"
              @grant="grantModerator"
              @revoke="revokeModerator"
            />
          </template>
        </WatchRoomSidePanel>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * Монтирование:
 * 1) cookie-логин + живой Bearer в sessionStorage;
 * 2) watchRoom.start() → SignalR;
 * 3) SyncPlayer создаётся по room.VideoUrl (YouTube / AllPlay).
 * Без Bearer (или с протухшим JWT) — редирект на /login.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { WatchRoomAuthSession } from "@/api/WatchRoomAuthSession";
import LobbyForm from "@/components/WatchRoom/LobbyForm.vue";
import PlaybackControls from "@/components/WatchRoom/PlaybackControls.vue";
import RoomChatPanel from "@/components/WatchRoom/RoomChatPanel.vue";
import RoomInfo from "@/components/WatchRoom/RoomInfo.vue";
import ViewersPanel from "@/components/WatchRoom/ViewersPanel.vue";
import WatchRoomSidePanel from "@/components/WatchRoom/WatchRoomSidePanel.vue";
import { useWatchRoom } from "@/features/watch-room/useWatchRoom";
import { useWatchRoomActivityFeed } from "@/features/watch-room/useWatchRoomActivityFeed";
import { useWatchRoomViewers } from "@/features/watch-room/useWatchRoomViewers";
import { createSyncPlayer } from "@/features/watch-room/player/createSyncPlayer";
import type { SyncPlayer } from "@/features/watch-room/player/SyncPlayer";
import { resolveVideoInput } from "@/features/watch-room/player/resolveVideoInput";
import type { WatchRoomConnectionStatus } from "@/features/watch-room/types";
import { ClientEventStore, EventTypes } from "@/store/ClientEventStore";
import { userStore } from "@/store/UserStore";

const route = useRoute();
const router = useRouter();
const currentUser = userStore();
const eventStore = ClientEventStore();
const playerContainer = ref<HTMLElement | null>(null);
const player: Ref<SyncPlayer | null> = ref(null);
const boundPlayerVideoUrl = ref<string | null>(null);
const watchRoom = useWatchRoom(player);

const {
  room,
  connectionStatus,
  isBusy,
  isLocallyDetached,
  isPlaybackUnlockRequired,
  canControl,
  isOwner,
  displayPosition,
  duration,
  leaveRoom,
  play,
  pause,
  seek,
  syncToRoom,
  unlockPlayback,
  setSeekInteractionActive,
  grantModerator,
  revokeModerator,
} = watchRoom;

const {
  viewers,
  viewerCount,
  isLoading: viewersLoading,
  nicknameByUserId,
  ensureProfiles,
} = useWatchRoomViewers(room);

const { events: activityEvents } = useWatchRoomActivityFeed(room, {
  ensureProfiles,
});

const isConnected = computed(() => connectionStatus.value === "connected");
const connectionLabel = computed(() => getConnectionLabel(connectionStatus.value));

/** Room code из `/watch-room/:room`, либо null на лобби `/watch-room`. */
function resolveRouteRoomId(param: unknown = route.params.room): string | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  return trimmed || null;
}

/** returnUrl для логина — сохраняет deep-link в комнату. */
function currentReturnUrl(): string {
  const roomId = resolveRouteRoomId();
  return roomId
    ? `/watch-room/${encodeURIComponent(roomId)}`
    : "/watch-room";
}

/** Синхронизирует адресную строку с текущим RoomId (или лобби). */
function syncRouteToRoom(roomId: string | null): void {
  if (!roomId) {
    if (route.name !== "watch-room") {
      void router.replace({ name: "watch-room" });
    }
    return;
  }

  if (resolveRouteRoomId() === roomId && route.name === "watch-room-room") {
    return;
  }

  void router.replace({
    name: "watch-room-room",
    params: { room: roomId },
  });
}

async function joinRoomById(roomId: string): Promise<void> {
  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    eventStore.push("Введите идентификатор комнаты.", EventTypes.Error);
    return;
  }

  await watchRoom.joinRoom(normalizedRoomId);
}

onMounted(async () => {
  if (!currentUser.loggedIn || !WatchRoomAuthSession.get()) {
    if (currentUser.loggedIn && !WatchRoomAuthSession.get()) {
      eventStore.push(
        "Сессия комнаты истекла. Войдите снова, чтобы получить новый токен.",
        EventTypes.Error
      );
    }
    await router.replace(`/login?returnUrl=${encodeURIComponent(currentReturnUrl())}`);
    return;
  }

  if (!playerContainer.value) {
    eventStore.push("Не удалось подготовить контейнер видеоплеера.", EventTypes.Error);
    return;
  }

  await watchRoom.start();

  if (!WatchRoomAuthSession.get()) {
    await router.replace(`/login?returnUrl=${encodeURIComponent(currentReturnUrl())}`);
    return;
  }

  const roomFromRoute = resolveRouteRoomId();
  if (roomFromRoute) {
    await joinRoomById(roomFromRoute);
  }
});

onBeforeUnmount(() => {
  void destroyBoundPlayer();
});

async function destroyBoundPlayer(): Promise<void> {
  const current = player.value;
  player.value = null;
  boundPlayerVideoUrl.value = null;
  if (!current) {
    return;
  }
  try {
    await current.destroy();
  } catch {
    // destroy is best-effort on teardown
  }
}

/** Создаёт/меняет SyncPlayer под VideoUrl комнаты (YouTube или AllPlay). */
async function ensurePlayerForVideoUrl(videoUrl: string | null): Promise<void> {
  if (!videoUrl) {
    await destroyBoundPlayer();
    return;
  }

  if (boundPlayerVideoUrl.value === videoUrl && player.value) {
    return;
  }

  const container = playerContainer.value;
  if (!container) {
    eventStore.push("Не удалось подготовить контейнер видеоплеера.", EventTypes.Error);
    return;
  }

  const resolved = resolveVideoInput(videoUrl);
  if (!resolved) {
    eventStore.push("Неподдерживаемый тип видео в комнате.", EventTypes.Error);
    await destroyBoundPlayer();
    return;
  }

  await destroyBoundPlayer();

  try {
    const nextPlayer = createSyncPlayer(container, resolved.url);
    player.value = nextPlayer;
    boundPlayerVideoUrl.value = resolved.url;
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Не удалось создать видеоплеер.";
    eventStore.push(message, EventTypes.Error);
  }
}

watch(
  () => room.value?.VideoUrl ?? null,
  videoUrl => {
    void ensurePlayerForVideoUrl(videoUrl);
  }
);

/** После create/join/leave подтягиваем URL к фактической комнате. */
watch(
  () => room.value?.RoomId ?? null,
  roomId => {
    syncRouteToRoom(roomId);
  }
);

/**
 * Смена `:room` в адресной строке (назад/вперёд или ручной переход)
 * без remount компонента.
 */
watch(
  () => resolveRouteRoomId(),
  async roomId => {
    if (!roomId || !WatchRoomAuthSession.get()) {
      return;
    }
    if (room.value?.RoomId === roomId) {
      return;
    }
    if (connectionStatus.value !== "connected") {
      return;
    }

    await joinRoomById(roomId);
  }
);

function create(videoUrl: string): void {
  const resolved = resolveVideoInput(videoUrl);
  if (!resolved) {
    eventStore.push(
      "Укажите корректную ссылку YouTube или embed AllPlay.",
      EventTypes.Error
    );
    return;
  }

  void watchRoom.createRoom(resolved.url);
}

function join(roomId: string): void {
  void joinRoomById(roomId);
}

async function copyRoomId(): Promise<void> {
  const roomId = room.value?.RoomId;
  if (!roomId) {
    eventStore.push("Идентификатор комнаты недоступен.", EventTypes.Error);
    return;
  }

  const shareUrl = `${window.location.origin}${router.resolve({
    name: "watch-room-room",
    params: { room: roomId },
  }).href}`;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    } else if (!copyWithLegacyFallback(shareUrl)) {
      throw new Error("Clipboard API недоступен.");
    }
    eventStore.push("Ссылка на комнату скопирована.", EventTypes.Success);
  } catch {
    eventStore.push(
      "Не удалось скопировать ссылку. Выделите Room ID и скопируйте вручную.",
      EventTypes.Error
    );
  }
}

function copyWithLegacyFallback(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

function getConnectionLabel(status: WatchRoomConnectionStatus): string {
  const labels: Record<WatchRoomConnectionStatus, string> = {
    disconnected: "Нет соединения",
    connecting: "Подключение…",
    connected: "Подключено",
    reconnecting: "Переподключение…",
  };
  return labels[status];
}
</script>

<style scoped lang="scss">
.watch-room-view {
  width: min(1200px, 100%);
  min-width: 0;
  margin: 0 auto;
  padding: 24px 0;
  color: var(--on-surface);

  &__room {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(280px, .8fr);
    align-items: stretch;
    min-width: 0;
  }

  &__main-column {
    display: grid;
    gap: 16px;
    align-content: start;
    min-width: 0;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 0;
  }

  &__sidebar-top {
    display: grid;
    flex: 0 0 auto;
    gap: 16px;
    min-width: 0;
  }

  &__viewers {
    flex: 1 1 auto;
    min-height: 180px;
  }

  &__player-shell {
    position: relative;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    background: #000;
  }

  &__unlock {
    position: absolute;
    z-index: 2;
    inset: 0;
    display: grid;
    place-items: center;
    border: 0;
    padding: 24px;
    color: #fff;
    font: inherit;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: .01em;
    background: rgba(0, 0, 0, .72);
    cursor: pointer;

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: -4px;
    }

    &:disabled {
      opacity: .7;
      cursor: not-allowed;
    }
  }

  &__player {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__player-shell :deep(iframe) {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

@media (max-width: 720px) {
  .watch-room-view {
    padding: 24px 0;

    &__room {
      grid-template-columns: minmax(0, 1fr);
    }

    &__viewers {
      min-height: 240px;
    }
  }
}
</style>

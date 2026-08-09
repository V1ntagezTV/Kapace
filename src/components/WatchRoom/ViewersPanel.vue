<!--
  Список зрителей комнаты: аватар, ник, роль (создатель / модератор / зритель).
  Профили подгружает родитель через useWatchRoomViewers.
  Владелец комнаты может назначить/снять модератора иконкой у участника.
-->
<template>
  <component
    :is="embedded ? 'div' : BaseBackground"
    v-bind="embedded ? {} : { type: 2 }"
    class="viewers-panel"
    :class="{
      'm3-bg-1 m-radius-2': !embedded,
      'viewers-panel--embedded': embedded,
    }"
  >
    <div
      v-if="showHeader"
      class="viewers-panel__header"
    >
      <h2 class="title-medium">
        Зрители
      </h2>
    </div>

    <ul
      v-if="viewers.length"
      class="viewers-panel__list"
      aria-label="Список зрителей комнаты"
    >
      <li
        v-for="viewer in viewers"
        :key="viewer.userId"
        class="viewers-panel__item"
      >
        <img
          class="viewers-panel__avatar"
          :src="viewer.avatarSrc"
          :alt="`Аватар ${viewer.nickname}`"
          width="40"
          height="40"
        >
        <div class="viewers-panel__meta">
          <span class="body-large viewers-panel__name">
            {{ viewer.nickname }}
          </span>
          <span class="label-medium viewers-panel__role">
            {{ roleLabel(viewer.role) }}
          </span>
        </div>
        <icon-button
          v-if="viewer.role === 'owner'"
          class="viewers-panel__moderator-toggle"
          :class="{
            'viewers-panel__moderator-toggle--active': viewer.role === 'owner',
          }"
        >
          <shield-star-icon />
        </icon-button>
        <icon-button
          v-if="canToggleModerator(viewer)"
          class="viewers-panel__moderator-toggle"
          :class="{
            'viewers-panel__moderator-toggle--active': viewer.role === 'moderator',
          }"
          :disabled="moderatorActionDisabled"
          :aria-label="viewer.role === 'moderator'
            ? `Снять права модератора у ${viewer.nickname}`
            : `Назначить ${viewer.nickname} модератором`"
          :aria-pressed="viewer.role === 'moderator'"
          @click="toggleModerator(viewer)"
        >
          <ShieldIcon class="viewers-panel__moderator-icon" />
        </icon-button>
      </li>
    </ul>
    <p v-else class="body-medium viewers-panel__empty">
      {{ loading ? "Загрузка зрителей…" : "В комнате пока никого нет." }}
    </p>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import ShieldIcon from "@/components/Icons/ShieldIcon.vue";
import {
  viewerRoleLabel,
  type WatchRoomViewer,
  type WatchRoomViewerRole,
} from "@/features/watch-room/useWatchRoomViewers";
import ShieldStarIcon from "@/components/Icons/ShieldStarIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";

const props = withDefaults(defineProps<{
  viewers: WatchRoomViewer[];
  loading?: boolean;
  isOwner?: boolean;
  busy?: boolean;
  connected?: boolean;
  /** Скрыть заголовок, если его уже даёт родитель (вкладки). */
  showHeader?: boolean;
  /** Без собственной карточки BaseBackground — внутри WatchRoomSidePanel. */
  embedded?: boolean;
}>(), {
  loading: false,
  isOwner: false,
  busy: false,
  connected: false,
  showHeader: true,
  embedded: false,
});

const emit = defineEmits<{
  (event: "grant", userId: number): void;
  (event: "revoke", userId: number): void;
}>();

const moderatorActionDisabled = computed(
  () => props.busy || !props.connected
);

function roleLabel(role: WatchRoomViewerRole): string {
  return viewerRoleLabel(role);
}

function canToggleModerator(viewer: WatchRoomViewer): boolean {
  return props.isOwner && viewer.role !== "owner";
}

function toggleModerator(viewer: WatchRoomViewer): void {
  if (!canToggleModerator(viewer) || moderatorActionDisabled.value) {
    return;
  }

  if (viewer.role === "moderator") {
    emit("revoke", viewer.userId);
    return;
  }

  emit("grant", viewer.userId);
}
</script>

<style scoped lang="scss">
.viewers-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  min-width: 0;
  height: 100%;
  padding: 20px;

  &--embedded {
    padding: 0;
    background: transparent;
  }

  &__header {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
  }

  &__count {
    color: var(--on-surface-variant-light);
    font-variant-numeric: tabular-nums;
  }

  &__list {
    display: grid;
    gap: 4px;
    flex: 1 1 auto;
    align-content: start;
    min-height: 0;
  }

  &__item {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
    border-radius: 10px;
  }

  &__avatar {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--surface-container-highest90);
  }

  &__meta {
    display: grid;
    flex: 1 1 auto;
    gap: 2px;
    min-width: 0;
    text-align: left;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__role {
    color: var(--on-surface-variant-light);

    &--owner {
      color: var(--primary40);
    }

    &--moderator {
      color: #2e7d32;
    }
  }

  &__moderator-toggle {
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid var(--outline-variant);
    border-radius: 50%;
    color: var(--on-surface-variant-light);
    background: transparent;
    cursor: pointer;

    &--active {
      border-color: #2e7d32;
      color: #2e7d32;
      background: rgba(46, 125, 50, .1);
    }

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: .55;
      cursor: not-allowed;
    }
  }

  &__moderator-icon {
    width: 20px;
    height: 20px;
  }

  &__empty {
    margin: 0;
    color: var(--on-surface-variant-light);
  }
}
</style>

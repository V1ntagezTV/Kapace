<!-- Карточка RoomId, статуса соединения, участников и кнопки «Выйти». -->
<template>
  <BaseBackground :type="2" class="room-info m3-bg-1 m-radius-2">
    <div class="room-info__header title-medium">
      Комната
    </div>

    <dl class="room-info__details body-medium column">
      <div class="row space-between">
        <span class="label-medium room-info__label">
          Room ID
        </span>
        <filter-chips-v2
          :enable-menu-icon="true"
          class="room-info__copy label-large"
          @click="emit('copy')"
        >
          <template #text>
            {{ room.RoomId }}
          </template>

          <template #menu-icon>
            <copy-icon style="width: 16px; height: 16px;" />
          </template>
        </filter-chips-v2>
      </div>
      <div class="row space-between">
        <dt class="label-medium h__center">
          Соединение
        </dt>
        <dd>
          <span
            class="room-info__status-dot"
            :class="{ 'room-info__status-dot--connected': connected }"
            aria-hidden="true"
          />
          {{ connectionLabel }}
        </dd>
      </div>
    </dl>

    <button
      class="room-info__leave label-large"
      type="button"
      :disabled="busy || !connected"
      @click="emit('leave')"
    >
      Покинуть комнату
    </button>
  </BaseBackground>
</template>

<script setup lang="ts">
/** Отображение метаданных комнаты; копирование RoomId и leave — через emit. */
import { computed } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import type {
  PlaybackChangeReason,
  PlaybackSnapshot,
} from "@/features/watch-room/types";
import CopyIcon from "@/components/Icons/CopyIcon.vue";
import FilterChipsV2 from "@/components/UseReadyComponents/MaterialComponents/FilterChipsV2.vue";

const props = defineProps<{
  room: PlaybackSnapshot;
  connected: boolean;
  connectionLabel: string;
  busy: boolean;
}>();

const emit = defineEmits<{
  (event: "copy"): void;
  (event: "leave"): void;
}>();

const reasonLabel = computed(() => {
  const labels: Record<PlaybackChangeReason, string> = {
    Created: "Комната создана",
    Joined: "Участник присоединился",
    Left: "Участник вышел",
    Play: "Запущено воспроизведение",
    Pause: "Воспроизведение приостановлено",
    Seek: "Изменена позиция",
    ModeratorGranted: "Назначен модератор",
    ModeratorRevoked: "Права модератора отозваны",
  };
  return labels[props.room.Reason];
});
</script>

<style scoped lang="scss">
.room-info {
  display: grid;
  gap: 20px;
  min-width: 0;
  padding: 20px;

  &__header {
    text-align: left;
  }

  &__label,
  dt {
    color: var(--on-surface-variant-light);
  }

  &__value {
    overflow-wrap: anywhere;
  }

  &__leave {
    min-height: 42px;
    padding: 10px 18px;
    border-radius: 999px;
    cursor: pointer;

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: .55;
      cursor: not-allowed;
    }
  }

  &__copy {
    color: var(--primary40);
    background: var(--primary90);

    &:hover {
      color: var(--primary20);
      background: var(--primary80);
    }
  }

  &__leave {
    width: 100%;
    color: var(--error40);
    background: var(--error90);
  }

  &__details {
    gap: 14px;

    dd {
      display: flex;
      gap: 7px;
      align-items: center;
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  &__status-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--error40);

    &--connected {
      background: #2e7d32;
    }
  }
}

@media (max-width: 720px) {
  .room-info {
    &__details {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>

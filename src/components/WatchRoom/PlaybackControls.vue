<!--
  Панель воспроизведения под видео в стиле плеера:
  LIVE + счётчик зрителей; Play/Pause + время; seek и sync ниже.
-->
<template>
  <BaseBackground :type="2" class="playback-controls m3-bg-1 m-radius-2">
    <div class="playback-controls__status-row">
      <span class="title-large">
        ЖОСКА ЕБЕМСЯ В ВИДЕО
      </span>

      <div class="row fit-content gap-16">
        <filter-chips-v2
          class="playback-controls__live label-large"
          :class="{ 'playback-controls__live--offline': isLocallyDetached }"
          role="status"
          :aria-label="isLocallyDetached
            ? 'Локальный просмотр: синхронизация с комнатой отключена'
            : 'Синхронизированный просмотр: трансляция комнаты активна'"
          :enable-text-icon="true"
        >
          <template #text-icon>
            <span
              class="playback-controls__live-dot"
              aria-hidden="true"
            />
          </template>

          <template #text>
            {{ isLocallyDetached ? "OFFLINE" : "LIVE" }}
          </template>
        </filter-chips-v2>

        <filter-chips-v2
          class="playback-controls__viewers label-large"
          :enable-text-icon="true"
          aria-label="Число зрителей в комнате"
        >
          <template #text-icon>
            <span
              class="playback-controls__viewer-dot"
              aria-hidden="true"
            />
          </template>
          <template #text>
            {{ viewerCount }}
          </template>
        </filter-chips-v2>
      </div>
    </div>

    <div class="playback-controls__transport">
      <button
        v-if="canControl"
        class="playback-controls__icon-button"
        type="button"
        :disabled="disabled"
        :aria-label="isPlaying ? 'Пауза для всех' : 'Запустить для всех'"
        :aria-pressed="isPlaying"
        @click="emit(isPlaying ? 'pause' : 'play')"
      >
        <pause-icon v-if="isPlaying" />
        <play-icon v-else />
      </button>
      <span
        v-else
        class="playback-controls__icon-button playback-controls__icon-button--static"
        aria-hidden="true"
      >
        <pause-icon v-if="isPlaying" />
        <play-icon v-else />
      </span>

      <span class="label-large playback-controls__time">
        {{ formatTime(visiblePosition) }}
        <span class="playback-controls__time-sep">/</span>
        {{ formatTime(duration) }}
      </span>

      <base-button
        class="playback-controls__sync label-large gap-8"
        type="button"
        :disabled="disabled"
        @click="emit('sync')"
      >
        <sync-icon />
        Синхронизировать
      </base-button>
    </div>

    <template v-if="canControl">
      <input
        id="watch-room-seek"
        class="playback-controls__range"
        type="range"
        min="0"
        :max="sliderMaximum"
        step="1"
        :value="draftPosition"
        :disabled="true"
        :aria-valuetext="formatTime(draftPosition)"
        @input="updateDraft"
        @change="commitSeek"
        @pointercancel="cancelSeek"
        @blur="cancelSeek"
      >
    </template>
  </BaseBackground>
</template>

<script setup lang="ts">
/**
 * Ползунок «Общая позиция» шлёт seek в Hub.
 * seek-interaction=true на время drag, чтобы drift-таймер не дёргал плеер.
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import UserIcon from "@/components/Icons/UserIcon.vue";
import FilterChipsV2 from "@/components/UseReadyComponents/MaterialComponents/FilterChipsV2.vue";
import UserAddIcon from "@/components/Icons/UserAddIcon.vue";
import UserIconOutlined from "@/components/Icons/MaterialIcons/UserIconOutlined.vue";
import PlayIcon from "@/components/Icons/PlayIcon.vue";
import PauseIcon from "@/components/Icons/PauseIcon.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import SyncIcon from "@/components/Icons/SyncIcon.vue";

const props = defineProps<{
  canControl: boolean;
  isLocallyDetached: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  busy: boolean;
  connected: boolean;
  viewerCount: number;
}>();

const emit = defineEmits<{
  (event: "play"): void;
  (event: "pause"): void;
  (event: "seek", seconds: number): void;
  (event: "sync"): void;
  (event: "seek-interaction", active: boolean): void;
}>();

const dragging = ref(false);
const draftPosition = ref(0);
const disabled = computed(() => props.busy || !props.connected);
const sliderMaximum = computed(() => Math.max(props.duration, 1));
const visiblePosition = computed(() => dragging.value ? draftPosition.value : props.position);

watch(
  () => [props.position, props.duration],
  () => {
    if (!dragging.value) {
      draftPosition.value = clampPosition(props.position);
    }
  },
  { immediate: true }
);

function clampPosition(value: number): number {
  const finiteValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  return Math.min(finiteValue, sliderMaximum.value);
}

function updateDraft(event: Event): void {
  if (!dragging.value) {
    emit("seek-interaction", true);
  }
  dragging.value = true;
  draftPosition.value = clampPosition(Number((event.target as HTMLInputElement).value));
}

function commitSeek(event: Event): void {
  draftPosition.value = clampPosition(Number((event.target as HTMLInputElement).value));
  dragging.value = false;
  emit("seek-interaction", false);

  if (Math.abs(draftPosition.value - props.position) >= 0.5) {
    emit("seek", draftPosition.value);
  }
}

function cancelSeek(): void {
  if (!dragging.value) {
    return;
  }

  draftPosition.value = clampPosition(props.position);
  dragging.value = false;
  emit("seek-interaction", false);
}

onBeforeUnmount(cancelSeek);

function formatTime(value: number): string {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder]
    .map(part => String(part).padStart(2, "0"))
    .join(":");
}
</script>

<style scoped lang="scss">
.playback-controls {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 16px 20px;

  &__status-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__live {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    color: #d32f2f;
    letter-spacing: .04em;
    background: var(--primary95);

    &--offline {
      color: var(--on-surface-variant-light);
    }
  }

  &__live-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px rgba(211, 47, 47, .14);
  }

  &__viewer-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: currentColor;
    color: #d32f2f;
    box-shadow: 0 0 0 3px rgba(211, 47, 47, .14);
  }

  &__live--offline &__live-dot {
    box-shadow: none;
  }

  &__viewers {
    gap: 8px;
    align-items: center;
    background: var(--primary95);
    cursor: unset;
  }

  &__viewers-icon {
    width: 20px;
    height: 20px;
  }

  &__transport {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    min-width: 0;
  }

  &__icon-button {
    display: inline-grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--primary100);
    background: var(--primary40);
    cursor: pointer;

    &--static {
      color: var(--on-surface-variant-light);
      background: var(--surface-container-highest90);
      cursor: default;
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

  &__glyph {
    width: 20px;
    height: 20px;
  }

  &__time {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__time-sep {
    margin: 0 4px;
    color: var(--on-surface-variant-light);
  }

  &__sync {
    margin-left: auto;
    min-height: 36px;
    padding: 8px 14px;
    border: 1px solid var(--primary40);
    border-radius: 999px;
    color: var(--primary40);
    background: transparent;
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

  &__seek {
    margin-bottom: -8px;
    color: var(--on-surface-variant-light);
  }

  &__range {
    appearance: none;
    width: 100%;
    height: 8px;
    min-width: 0;
    border-radius: 999px;
    background: var(--surface-container-highest90);
    accent-color: var(--primary40);
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border: 2px solid var(--primary100);
      border-radius: 50%;
      background: var(--primary40);
      box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
    }

    &::-moz-range-track {
      height: 8px;
      border-radius: 999px;
      background: var(--surface-container-highest90);
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border: 2px solid var(--primary100);
      border-radius: 50%;
      background: var(--primary40);
    }

    &:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: 3px;
    }
  }
}

@media (max-width: 720px) {
  .playback-controls {
    &__sync {
      margin-left: 0;
      width: 100%;
    }
  }
}
</style>

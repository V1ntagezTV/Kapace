<!-- Лобби: создать комнату по YouTube / AllPlay или войти по RoomId. -->
<template>
  <section class="watch-room-lobby" aria-labelledby="watch-room-lobby-title">
    <div class="watch-room-lobby__heading">
      <h1 id="watch-room-lobby-title" class="headline-medium">
        Совместный просмотр
      </h1>
      <p class="body-medium watch-room-lobby__status" role="status">
        <span
          class="watch-room-lobby__status-dot"
          :class="{ 'watch-room-lobby__status-dot--connected': connected }"
          aria-hidden="true"
        />
        {{ connectionLabel }}
      </p>
    </div>

    <div class="watch-room-lobby__cards">
      <BaseBackground :type="2" class="watch-room-lobby__card m3-bg-1 m-radius-2">
        <form class="watch-room-lobby__form" @submit.prevent="submitCreate">
          <div>
            <h2 class="title-large">
              Создать комнату
            </h2>
            <p class="body-medium watch-room-lobby__hint">
              Вставьте ссылку YouTube или embed AllPlay (ссылка / iframe).
            </p>
          </div>
          <BaseInput
            v-model="videoUrl"
            class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
            label="Ссылка или iframe"
            place-holder="https://www.youtube.com/watch?v=… или iframe AllPlay"
            type="text"
            autocomplete="off"
            aria-label="Ссылка YouTube или embed AllPlay"
            :disabled="disabled"
          />
          <button
            class="watch-room-lobby__button label-large" type="submit"
            :disabled="disabled"
          >
            Создать
          </button>
        </form>
      </BaseBackground>

      <BaseBackground :type="2" class="watch-room-lobby__card m3-bg-1 m-radius-2">
        <form class="watch-room-lobby__form" @submit.prevent="submitJoin">
          <div>
            <h2 class="title-large">
              Войти в комнату
            </h2>
            <p class="body-medium watch-room-lobby__hint">
              Введите идентификатор комнаты.
            </p>
          </div>
          <BaseInput
            v-model="roomId"
            class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
            label="Room ID"
            place-holder="Идентификатор комнаты"
            autocomplete="off"
            aria-label="Идентификатор комнаты"
            :disabled="disabled"
          />
          <button
            class="watch-room-lobby__button label-large" type="submit"
            :disabled="disabled"
          >
            Присоединиться
          </button>
        </form>
      </BaseBackground>
    </div>
  </section>
</template>

<script setup lang="ts">
/** Формы Create/Join; сами Hub-вызовы делает родитель через @create / @join. */
import { computed, ref } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseInput from "@/components/Base/BaseInput.vue";

const props = defineProps<{
  connected: boolean;
  busy: boolean;
  connectionLabel: string;
}>();

const emit = defineEmits<{
  (event: "create", videoUrl: string): void;
  (event: "join", roomId: string): void;
}>();

const videoUrl = ref("");
const roomId = ref("");
const disabled = computed(() => props.busy || !props.connected);

function submitCreate(): void {
  emit("create", videoUrl.value.trim());
}

function submitJoin(): void {
  emit("join", roomId.value.trim());
}
</script>

<style scoped lang="scss">
.watch-room-lobby {
  display: grid;
  gap: 24px;
  width: 100%;

  &__heading {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    justify-content: space-between;
  }

  &__status {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    color: var(--on-surface-variant-light);
  }

  &__status-dot {
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--error40);

    &--connected {
      background: #2e7d32;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  &__card {
    min-width: 0;
    padding: 24px;
  }

  &__form {
    display: grid;
    gap: 20px;
    height: 100%;
  }

  &__hint {
    margin-top: 6px;
    color: var(--on-surface-variant-light);
  }

  &__button {
    min-height: 46px;
    width: 100%;
    padding: 12px 24px;
    border: 0;
    border-radius: 999px;
    color: var(--primary100);
    background: var(--primary40);
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--primary50);
    }

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: 2px;
    }

    &:disabled {
      color: var(--on-surface-variant-light);
      background: var(--surface-container-highest90);
      cursor: not-allowed;
    }
  }
}

@media (max-width: 720px) {
  .watch-room-lobby {
    &__cards {
      grid-template-columns: minmax(0, 1fr);
    }

    &__card {
      padding: 20px 16px;
    }
  }
}
</style>

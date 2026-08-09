<!--
  Лента системных событий комнаты (вход/выход).
  Поле ввода чата появится позже.
-->
<template>
  <div class="room-chat-panel">
    <ul
      v-if="lines.length"
      class="room-chat-panel__list"
      aria-label="События комнаты"
    >
      <li
        v-for="line in lines"
        :key="line.id"
        class="room-chat-panel__item body-medium"
      >
        {{ line.text }}
      </li>
    </ul>
    <p
      v-else
      class="body-medium room-chat-panel__empty"
    >
      Пока нет событий.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { WatchRoomActivityEvent } from "@/features/watch-room/useWatchRoomActivityFeed";

const props = defineProps<{
  events: WatchRoomActivityEvent[];
  nicknameByUserId: Record<string, string>;
}>();

const lines = computed(() =>
  props.events.map(event => {
    const nickname =
      props.nicknameByUserId[String(event.userId)]
      || `Пользователь ${event.userId}`;
    return {
      id: event.id,
      text: event.type === "joined"
        ? `${nickname} вошёл в комнату`
        : `${nickname} вышел из комнаты`,
    };
  })
);
</script>

<style scoped lang="scss">
.room-chat-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
  height: 100%;
  overflow: auto;

  &__list {
    display: grid;
    gap: 8px;
    align-content: start;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    margin: 0;
    color: var(--on-surface-variant-light);
    text-align: left;
  }

  &__empty {
    margin: 0;
    color: var(--on-surface-variant-light);
  }
}
</style>

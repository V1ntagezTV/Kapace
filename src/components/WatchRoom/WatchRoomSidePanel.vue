<!--
  Правая колонка контента комнаты: вкладки Чат / Зрители.
  Стиль вкладок — как pill-tabs в MarkdownEditor.
-->
<template>
  <BaseBackground
    :type="2"
    class="watch-room-side-panel m3-bg-1 m-radius-2"
  >
    <div
      class="watch-room-side-panel__tabs"
      role="tablist"
      aria-label="Разделы комнаты"
    >
      <button
        type="button"
        role="tab"
        class="watch-room-side-panel__tab body-medium"
        :class="{ 'watch-room-side-panel__tab--active': activeTab === 'chat' }"
        :aria-selected="activeTab === 'chat'"
        @click="activeTab = 'chat'"
      >
        Чат
      </button>
      <button
        type="button"
        role="tab"
        class="watch-room-side-panel__tab body-medium"
        :class="{ 'watch-room-side-panel__tab--active': activeTab === 'viewers' }"
        :aria-selected="activeTab === 'viewers'"
        @click="activeTab = 'viewers'"
      >
        Зрители
      </button>
    </div>

    <div
      v-show="activeTab === 'chat'"
      class="watch-room-side-panel__body"
      role="tabpanel"
      aria-label="Чат"
    >
      <slot name="chat" />
    </div>

    <div
      v-show="activeTab === 'viewers'"
      class="watch-room-side-panel__body"
      role="tabpanel"
      aria-label="Зрители"
    >
      <slot name="viewers" />
    </div>
  </BaseBackground>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";

export type WatchRoomSideTab = "chat" | "viewers";

const activeTab = ref<WatchRoomSideTab>("chat");
</script>

<style scoped lang="scss">
.watch-room-side-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  min-width: 0;
  height: 100%;
  padding: 20px;

  &__tabs {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tab {
    padding: 8px 14px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: var(--primary40);
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease;

    &:hover {
      background: rgba(82, 90, 146, .08);
    }

    &--active {
      background: var(--surface-container-default94);
      border-color: var(--primary40);
      color: var(--dark-primary);
    }

    &:focus-visible {
      outline: 3px solid var(--primary80);
      outline-offset: 2px;
    }
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    overflow: auto;
  }
}
</style>

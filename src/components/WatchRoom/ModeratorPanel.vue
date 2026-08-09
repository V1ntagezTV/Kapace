<!--
  Назначение/снятие модераторов.
  Grant/Revoke доступны только владельцу; список видят все участники.
-->
<template>
  <BaseBackground :type="2" class="moderator-panel m3-bg-1 m-radius-2">
    <div>
      <h2 class="title-medium">
        Модераторы
      </h2>
      <p class="body-medium moderator-panel__hint">
        Модераторы могут управлять воспроизведением.
      </p>
    </div>

    <form
      v-if="isOwner" class="moderator-panel__grant"
      @submit.prevent="submitGrant"
    >
      <BaseInput
        v-model="userId"
        class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
        label="ID пользователя"
        place-holder="Положительное целое число"
        inputmode="numeric"
        autocomplete="off"
        aria-label="Идентификатор нового модератора"
        :mark-as-invalid-input="Boolean(validationMessage)"
        :disabled="disabled"
        @update:model-value="validationMessage = ''"
      />
      <button
        class="moderator-panel__grant-button label-large" type="submit"
        :disabled="disabled"
      >
        Назначить
      </button>
      <p
        v-if="validationMessage" class="body-small moderator-panel__error"
        role="alert"
      >
        {{ validationMessage }}
      </p>
    </form>

    <ul v-if="moderatorUserIds.length" class="moderator-panel__list">
      <li
        v-for="moderatorId in moderatorUserIds"
        :key="moderatorId"
        class="moderator-panel__item"
      >
        <span class="body-large">Пользователь {{ moderatorId }}</span>
        <button
          v-if="isOwner && moderatorId !== ownerUserId"
          class="moderator-panel__revoke label-large"
          type="button"
          :disabled="disabled"
          :aria-label="`Отозвать права модератора у пользователя ${moderatorId}`"
          @click="emit('revoke', moderatorId)"
        >
          Отозвать
        </button>
      </li>
    </ul>
    <p v-else class="body-medium moderator-panel__empty">
      Модераторы пока не назначены.
    </p>
  </BaseBackground>
</template>

<script setup lang="ts">
/** UI grant/revoke; Hub-вызовы выполняет родитель (@grant / @revoke). */
import { computed, ref } from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseInput from "@/components/Base/BaseInput.vue";

const props = defineProps<{
  moderatorUserIds: number[];
  ownerUserId: number;
  isOwner: boolean;
  busy: boolean;
  connected: boolean;
}>();

const emit = defineEmits<{
  (event: "grant", userId: number): void;
  (event: "revoke", userId: number): void;
}>();

const userId = ref("");
const validationMessage = ref("");
const disabled = computed(() => props.busy || !props.connected);

function submitGrant(): void {
  const normalized = userId.value.trim();
  const parsedUserId = Number(normalized);
  if (!/^\d+$/.test(normalized) || !Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    validationMessage.value = "Введите положительный целочисленный ID пользователя.";
    return;
  }

  validationMessage.value = "";
  userId.value = "";
  emit("grant", parsedUserId);
}
</script>

<style scoped lang="scss">
.moderator-panel {
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: 20px;

  &__hint,
  &__empty {
    margin-top: 4px;
    color: var(--on-surface-variant-light);
  }

  &__grant {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  &__grant-button,
  &__revoke {
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

  &__grant-button {
    border: 0;
    color: var(--primary100);
    background: var(--primary40);
  }

  &__revoke {
    flex: 0 0 auto;
    border: 1px solid var(--error40);
    color: var(--error40);
    background: transparent;
  }

  &__error {
    grid-column: 1 / -1;
    color: var(--error40);
  }

  &__list {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--surface-container-low96);
  }
}

@media (max-width: 720px) {
  .moderator-panel {
    &__grant {
      grid-template-columns: minmax(0, 1fr);
    }

    &__grant-button {
      width: 100%;
    }

    &__item {
      align-items: stretch;
      flex-direction: column;
    }

    &__revoke {
      width: 100%;
    }
  }
}
</style>

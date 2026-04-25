<template>
  <div class="settings-nickname column h__fill v__start gap-8">
    <p class="label-medium text__one-line">
      Отображаемое имя
    </p>
    <div class="row fill h__space-between v__center gap-16">
      <base-input
        :model-value="nickname"
        class="column m-border m-border-hover m-border-active m-radius-8 m3-bg-2"
        :class="inputStateClass"
        place-holder="Введите имя"
        maxlength="20"
        :input-validator="inputValidator"
        @update:model-value="onInput"
      >
        <template #end-icon>
          <div v-if="availability === 'available'" class="row gap-8">
            <p class="settings-nickname__hint settings-nickname__hint--ok row body-medium text__one-line text__center">
              Никнейм свободен!
            </p>
            <div class="settings-nickname__icon">
              <check-circle-filled-icon class="settings-nickname__icon-ok" />
            </div>
          </div>
          <div v-else-if="availability === 'taken'" class="row gap-8">
            <p class="settings-nickname__hint settings-nickname__hint--err row body-medium text__one-line text__center">
              Никнейм занят
            </p>
            <div class="settings-nickname__icon">
              <warning-icon class="settings-nickname__icon-err" />
            </div>
          </div>
        </template>
      </base-input>
      <base-button
        class="m-radius-circle"
        variant="filled"
        :class="{ 'settings-nickname__save--ready': availability === 'available' }"
        :disabled="saving"
        @click="emit('save')"
      >
        Сохранить
      </base-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import BaseButton from '@/components/Base/BaseButton.vue';
import BaseInput from '@/components/Base/BaseInput.vue';
import CheckCircleFilledIcon from '@/components/Icons/CheckCircleFilledIcon.vue';
import WarningIcon from '@/components/Icons/WarningIcon.vue';
import type { NicknameAvailability } from '@/composables/settings/useSettingsNickname';

const props = defineProps<{
  nickname: string;
  availability: NicknameAvailability;
  saving: boolean;
  inputValidator: (value: string) => boolean;
}>();

const emit = defineEmits<{
  (e: 'update:nickname', value: string): void;
  (e: 'probe'): void;
  (e: 'save'): void;
}>();

const inputStateClass = computed(() => ({
  'settings-nickname__input--valid': props.availability === 'available',
  'settings-nickname__input--invalid': props.availability === 'taken',
}));

function onInput(value: string) {
  emit('update:nickname', value);
  emit('probe');
}
</script>

<style lang="scss" scoped>
.settings-nickname {
  &__input--valid {
    border: 1px solid green;
  }

  &__input--invalid {
    border: 1px solid red;
  }

  &__save--ready {
    border: 1px solid green;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    user-select: none;
  }

  &__icon-ok {
    color: darkgreen;
  }

  &__icon-err {
    color: var(--error-light);
  }

  &__hint--ok {
    color: darkgreen;
  }

  &__hint--err {
    color: var(--error-light);
  }
}
</style>

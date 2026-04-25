<template>
  <div class="settings-email column h__fill v__start gap-8">
    <p class="label-medium text__one-line">
      Электронная почта
    </p>
    <div class="row fill h__space-between v__center gap-16">
      <base-input
        :model-value="email"
        class="column m-border m-radius-8 m3-bg-2"
        disabled
      />
      <base-button
        class="m-radius-circle"
        variant="filled"
        @click="emit('open-change')"
      >
        Изменить
      </base-button>
      <email-change-modal
        v-if="changeOpen"
        :current-email="email"
        :is-visible="changeOpen"
        @on:close="emit('close-change')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from '@/components/Base/BaseButton.vue';
import BaseInput from '@/components/Base/BaseInput.vue';
import EmailChangeModal from '@/components/Modal/EmailChangeModal.vue';

defineProps<{
  email: string;
  changeOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'open-change'): void;
  (e: 'close-change'): void;
}>();
</script>

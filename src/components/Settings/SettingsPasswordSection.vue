<template>
  <div class="settings-password row gap-16">
    <base-button
      class="m-border m-radius-circle fit-content"
      variant="filled"
      @click="emit('open-modal')"
    >
      Сменить пароль
    </base-button>
    <update-password-modal
      :is-visible="modalOpen"
      @on:close="emit('close-modal')"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseButton from '@/components/Base/BaseButton.vue';
import UpdatePasswordModal from '@/components/Modal/UpdatePasswordModal.vue';

defineProps<{
  modalOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'open-modal'): void;
  (e: 'close-modal'): void;
}>();
</script>

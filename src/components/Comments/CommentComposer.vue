<template>
  <form
    class="comment-composer column gap-8"
    @submit.prevent="onSubmit"
  >
    <base-text-area
      v-model="text"
      class="m-radius-8 m-border m-border-hover m-border-active comment-composer__textarea"
      :placeholder="placeholder"
      :mark-as-invalid-input="isInvalid"
      :max-length="COMMENT_TEXT_MAX_LENGTH"
    />
    <div class="row gap-8 h__end">
      <base-button
        v-if="showCancel"
        type="button"
        class="comment-composer__cancel label-large"
        @click="$emit('cancel')"
      >
        Отмена
      </base-button>
      <base-button
        variant="filled"
        class="m-radius-8 fit-content"
      >
        {{ isSubmitting ? submittingLabel : submitLabel }}
      </base-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import BaseButton from '@/components/Base/BaseButton.vue';
import BaseTextArea from '@/components/Base/BaseTextArea.vue';
import {
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
} from '@/api/CommentApi';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  initialText?: string;
  placeholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  showCancel?: boolean;
  isSubmitting?: boolean;
}>(), {
  initialText: '',
  placeholder: `Напишите комментарий (до ${COMMENT_TEXT_MAX_LENGTH} символов)`,
  submitLabel: 'Отправить',
  submittingLabel: 'Отправка…',
  showCancel: false,
  isSubmitting: false,
});

const emits = defineEmits<{
  (e: 'submit', text: string): void;
  (e: 'cancel'): void;
}>();

const text = ref(props.initialText);
const isInvalid = ref(false);

watch(() => props.initialText, (value) => {
  text.value = value;
});

function onSubmit() {
  if (props.isSubmitting) {
    return;
  }

  const trimmed = text.value.trim();
  isInvalid.value =
    trimmed.length < COMMENT_TEXT_MIN_LENGTH ||
    trimmed.length > COMMENT_TEXT_MAX_LENGTH;

  if (isInvalid.value) {
    return;
  }

  emits('submit', trimmed);
}

function reset() {
  text.value = '';
  isInvalid.value = false;
}

defineExpose({ reset });
</script>

<style scoped lang="scss">
.comment-composer {
  &__textarea {
    background: var(--primary95);
  }

  &__cancel {
    padding: 10px 16px;
    border: 1px solid var(--primary40);
    border-radius: 8px;
    background: transparent;
    color: var(--primary40);
    cursor: pointer;
  }
}
</style>

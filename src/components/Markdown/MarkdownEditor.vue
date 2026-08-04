<template>
  <div
    class="markdown-editor"
    :class="{ 'markdown-editor--invalid': markAsInvalidInput }"
  >
    <div class="markdown-editor__tabs">
      <button
        type="button"
        class="markdown-editor__tab body-medium"
        :class="{ 'markdown-editor__tab--active': activeTab === 'edit' }"
        @click="activeTab = 'edit'"
      >
        Редактор
      </button>
      <button
        type="button"
        class="markdown-editor__tab body-medium"
        :class="{ 'markdown-editor__tab--active': activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        Предпросмотр
      </button>
    </div>

    <div
      v-show="activeTab === 'edit'"
      class="markdown-editor__edit-panel m3-bg-3 m-radius-1 m-border m-border-hover m-border-active"
    >
      <div class="markdown-editor__toolbar">
        <button
          v-for="action in toolbarActions"
          :key="action.id"
          type="button"
          class="markdown-editor__toolbar-button body-medium"
          :title="action.title"
          @click="applyAction(action.id)"
        >
          {{ action.label }}
        </button>
      </div>

      <textarea
        ref="textareaRef"
        class="markdown-editor__textarea body-medium"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        @input="onInput"
      />
    </div>

    <div
      v-show="activeTab === 'preview'"
      class="markdown-editor__preview m3-bg-3 m-radius-1 m-border"
    >
      <MarkdownContent :source="modelValue" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import MarkdownContent from '@/components/Markdown/MarkdownContent.vue';
import {
  applyMarkdownEditorAction,
  MarkdownEditorAction,
} from '@/helpers/markdownEditor';

defineProps<{
  modelValue: string | null;
  placeholder?: string | null;
  markAsInvalidInput?: boolean;
}>();

const emit = defineEmits<{
  (eventName: 'update:modelValue', value: string): void;
}>();

const activeTab = ref<'edit' | 'preview'>('edit');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const toolbarActions: Array<{ id: MarkdownEditorAction; label: string; title: string }> = [
  { id: 'heading', label: 'H', title: 'Заголовок' },
  { id: 'bold', label: 'B', title: 'Жирный' },
  { id: 'italic', label: 'I', title: 'Курсив' },
  { id: 'unorderedList', label: '•', title: 'Маркированный список' },
  { id: 'orderedList', label: '1.', title: 'Нумерованный список' },
  { id: 'blockquote', label: '❝', title: 'Цитата' },
  { id: 'link', label: '🔗', title: 'Ссылка' },
  { id: 'code', label: '</>', title: 'Inline-код' },
];

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

async function applyAction(action: MarkdownEditorAction) {
  const textarea = textareaRef.value;
  if (!textarea) {
    return;
  }

  const result = applyMarkdownEditorAction(
    textarea.value,
    textarea.selectionStart,
    textarea.selectionEnd,
    action,
  );

  emit('update:modelValue', result.value);

  await nextTick();
  textarea.focus();
  textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
}
</script>

<style lang="scss" scoped>
.markdown-editor {
  display: grid;
  gap: 8px;
  width: 100%;

  &--invalid .markdown-editor__edit-panel,
  &--invalid .markdown-editor__preview {
    border-color: var(--warning-red);
  }

  &__tabs {
    display: flex;
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
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
    }

    &--active {
      background: var(--surface-container-default94);
      border-color: var(--primary40);
      color: var(--dark-primary);
    }
  }

  &__edit-panel,
  &__preview {
    display: grid;
    gap: 0;
    overflow: hidden;
    background: var(--surface-container-default94);
    transition:
      background-color 0.2s,
      border-top-color 0.15s,
      border-bottom-color 0.15s,
      border-right-color 0.15s,
      border-left-color 0.15s;

    &:hover {
      background: var(--surface-container-high92);
    }
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--font-gray-v2);
  }

  &__toolbar-button {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--dark-primary);
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
    }

    &:focus-visible {
      outline: 2px solid var(--primary40);
      outline-offset: 2px;
    }
  }

  &__textarea {
    width: 100%;
    min-height: 220px;
    resize: vertical;
    padding: 12px 16px;
    border: none;
    background: transparent;
    outline: none;
    line-height: 24px;
  }

  &__preview {
    min-height: 220px;
    padding: 12px 16px;
  }
}
</style>

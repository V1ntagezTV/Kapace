<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="markdown-content body-medium"
    v-html="safeHtml"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { renderMarkdown } from '@/helpers/markdown';

const props = defineProps<{
  source: string | null;
}>();

const safeHtml = computed(() => renderMarkdown(props.source));
</script>

<style lang="scss" scoped>
.markdown-content {
  width: 100%;
  word-wrap: break-word;
  text-align: justify;
  letter-spacing: 0.04em;
  color: inherit;

  :deep(p) {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
    font-weight: 600;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: 24px;
  }

  :deep(h2) {
    font-size: 20px;
  }

  :deep(h3) {
    font-size: 18px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(blockquote) {
    margin: 8px 0;
    padding: 8px 12px;
    border-left: 3px solid var(--primary40);
    background: var(--surface-container-default94);
    border-radius: 4px;
  }

  :deep(a) {
    color: var(--primary40);
    text-decoration: underline;
    text-underline-offset: 3px;
    word-break: break-word;
  }

  :deep(code) {
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--surface-container-default94);
    font-family: Consolas, 'Courier New', monospace;
  }

  :deep(pre) {
    margin: 8px 0;
    padding: 12px;
    border-radius: 8px;
    background: var(--surface-container-default94);
    overflow-x: auto;

    code {
      padding: 0;
      background: transparent;
    }
  }
}
</style>

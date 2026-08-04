<template>
  <BaseBackground :type="2" class="person-details">
    <div class="person-details__title-main">
      <h1 class="headline-medium person-details__title">
        {{ person.Name }}
      </h1>
    </div>

    <div class="person-details__splitter" />

    <div class="person-details__description-wrapper">
      <div
        ref="descriptionRef"
        class="person-details__description"
        :class="{ 'person-details__description--collapsed': !isDescriptionExpanded }"
      >
        <MarkdownContent :source="person.Description" />
      </div>
      <button
        v-if="isDescriptionOverflowing"
        class="person-details__description-toggle"
        type="button"
        @click="isDescriptionExpanded = !isDescriptionExpanded"
      >
        {{ isDescriptionExpanded ? 'Свернуть' : 'Показать полностью' }}
      </button>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from '@/components/Base/BaseBackground.vue';
import MarkdownContent from '@/components/Markdown/MarkdownContent.vue';
import { V1PersonInfo } from '@/api/PersonService';
import { nextTick, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';

const props = defineProps({
  person: { type: Object as PropType<V1PersonInfo>, required: true },
});

const descriptionRef = ref<HTMLElement | null>(null);
const isDescriptionExpanded = ref(false);
const isDescriptionOverflowing = ref(false);
let descriptionResizeObserver: ResizeObserver | null = null;

const updateDescriptionOverflow = () => {
  const description = descriptionRef.value;
  if (!description) {
    return;
  }

  isDescriptionOverflowing.value = description.scrollHeight > 200;
};

onMounted(async () => {
  await nextTick();
  updateDescriptionOverflow();

  if (descriptionRef.value) {
    descriptionResizeObserver = new ResizeObserver(updateDescriptionOverflow);
    descriptionResizeObserver.observe(descriptionRef.value);
  }
});

onBeforeUnmount(() => {
  descriptionResizeObserver?.disconnect();
});

watch(() => props.person.Description, async () => {
  isDescriptionExpanded.value = false;
  await nextTick();
  updateDescriptionOverflow();
});
</script>

<style lang="scss" scoped>
.person-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 20px;

  &__title-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  &__title {
    text-align: left;
    padding: 0;
    margin: 0;
  }

  &__splitter {
    height: 2px;
    width: 100%;
    border: 1px solid #EEEFF4;
  }

  &__description-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__description {
    width: 100%;
    word-wrap: break-word;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    text-align: justify;
    letter-spacing: 0.04em;
    margin: 0;
  }

  &__description--collapsed {
    max-height: 200px;
    overflow: hidden;
  }

  &__description-toggle {
    margin-top: 8px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--primary40);
    font: inherit;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
}
</style>

<template>
  <div class="image-list-diff">
    <div
      v-if="diff.removed.length > 0"
      class="image-list-diff__row image-list-diff__row--removed"
    >
      <span class="image-list-diff__prefix">−</span>
      <div class="image-list-diff__grid">
        <image-diff-thumbnail
          v-for="(imageSrc, index) in diff.removed"
          :key="`removed-${index}-${imageSrc}`"
          :src="imageSrc"
          :alt="`${name}, удалённое изображение ${index + 1}`"
          variant="removed"
          @preview="openPreview(index)"
        />
      </div>
    </div>

    <div
      v-if="diff.added.length > 0"
      class="image-list-diff__row image-list-diff__row--added"
    >
      <span class="image-list-diff__prefix">+</span>
      <div class="image-list-diff__grid">
        <image-diff-thumbnail
          v-for="(imageSrc, index) in diff.added"
          :key="`added-${index}-${imageSrc}`"
          :src="imageSrc"
          :alt="`${name}, добавленное изображение ${index + 1}`"
          variant="added"
          @preview="openPreview(diff.removed.length + index)"
        />
      </div>
    </div>

    <p
      v-if="diff.removed.length === 0 && diff.added.length === 0"
      class="body-medium image-list-diff__empty"
    >
      Изменений в изображениях нет
    </p>

    <image-preview-modal
      :is-open="isPreviewOpen"
      :images="previewImages"
      :current-index="previewIndex"
      @update:current-index="previewIndex = $event"
      @close="closePreview"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import ImageDiffThumbnail from '@/components/ContentHistory/ImageDiffThumbnail.vue';
import ImagePreviewModal, { type PreviewImage } from '@/components/UseReadyComponents/ImagePreviewModal.vue';
import { computeImageListDiff } from '@/helpers/imageDiff';

const props = defineProps<{
  name: string;
  oldValue: string | null | undefined;
  newValue: string | null | undefined;
}>();

const diff = computed(() => computeImageListDiff(props.oldValue, props.newValue));
const isPreviewOpen = ref(false);
const previewIndex = ref(0);

const previewImages = computed<PreviewImage[]>(() => [
  ...diff.value.removed.map((src, index) => ({
    src,
    alt: `${props.name}, удалённое изображение ${index + 1}`,
  })),
  ...diff.value.added.map((src, index) => ({
    src,
    alt: `${props.name}, добавленное изображение ${index + 1}`,
  })),
]);

function openPreview(index: number) {
    previewIndex.value = index;
    isPreviewOpen.value = true;
}

function closePreview() {
    isPreviewOpen.value = false;
}
</script>

<style lang="scss" scoped>
.image-list-diff {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: calc(100% + 32px);
  margin: 0 -16px;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 28px;
    border-radius: 0;

    &--removed {
      background: #ffeef0;
    }

    &--added {
      background: #e6ffed;
    }
  }

  &__prefix {
    flex-shrink: 0;
    width: 12px;
    padding-top: 2px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    user-select: none;
  }

  &__row--removed &__prefix {
    color: #c62828;
  }

  &__row--added &__prefix {
    color: #2e7d32;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  &__empty {
    margin: 0;
    padding: 0 16px;
    color: #79747E;
  }
}
</style>

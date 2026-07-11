<template>
  <div class="avatar-diff">
    <div class="avatar-diff__row avatar-diff__row--old">
      <span class="avatar-diff__prefix">−</span>
      <image-diff-thumbnail
        :src="oldImageSrc"
        :alt="`${name}, предыдущая аватарка`"
        variant="removed"
        :clickable="!!oldImageSrc"
        @preview="openPreview(oldImageSrc)"
      />
    </div>

    <div class="avatar-diff__row avatar-diff__row--new">
      <span class="avatar-diff__prefix">+</span>
      <image-diff-thumbnail
        :src="newImageSrc"
        :alt="`${name}, новая аватарка`"
        variant="added"
        :clickable="!!newImageSrc"
        @preview="openPreview(newImageSrc)"
      />
    </div>

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
import { parseImageValues, resolveImageSrc } from '@/helpers/imageDiff';

const props = defineProps<{
  name: string;
  oldValue: string | null | undefined;
  newValue: string | null | undefined;
}>();

const isPreviewOpen = ref(false);
const previewIndex = ref(0);

const oldImageSrc = computed(() => {
    const [firstValue] = parseImageValues(props.oldValue);
    return resolveImageSrc(firstValue);
});

const newImageSrc = computed(() => {
    const [firstValue] = parseImageValues(props.newValue);
    return resolveImageSrc(firstValue);
});

const previewImages = computed<PreviewImage[]>(() => {
    const images: PreviewImage[] = [];

    if (oldImageSrc.value) {
        images.push({
            src: oldImageSrc.value,
            alt: `${props.name}, предыдущая аватарка`,
        });
    }

    if (newImageSrc.value) {
        images.push({
            src: newImageSrc.value,
            alt: `${props.name}, новая аватарка`,
        });
    }

    return images;
});

function openPreview(imageSrc: string) {
    const index = previewImages.value.findIndex(image => image.src === imageSrc);
    if (index < 0) {
        return;
    }

    previewIndex.value = index;
    isPreviewOpen.value = true;
}

function closePreview() {
    isPreviewOpen.value = false;
}
</script>

<style lang="scss" scoped>
.avatar-diff {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  margin: 0;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 22px;
    border-radius: 0;

    &--old {
      background: #ffeef0;
    }

    &--new {
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

  &__row--old &__prefix {
    color: #c62828;
  }

  &__row--new &__prefix {
    color: #2e7d32;
  }
}
</style>

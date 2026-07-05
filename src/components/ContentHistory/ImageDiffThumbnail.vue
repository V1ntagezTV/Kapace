<template>
  <button
    v-if="displaySrc"
    type="button"
    class="image-diff-thumb m-radius-2"
    :class="[
      `image-diff-thumb--${variant}`,
      { 'image-diff-thumb--clickable': clickable }
    ]"
    @click="handleClick"
  >
    <img
      class="image-diff-thumb__image"
      :src="displaySrc"
      :alt="alt"
      @error="onImageError"
    >
  </button>
  <div
    v-else
    class="image-diff-thumb image-diff-thumb--placeholder m-radius-2"
    :class="`image-diff-thumb--${variant}`"
  >
    <div class="image-diff-thumb__placeholder body-medium">
      Нет изображения
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  variant: 'removed' | 'added' | 'neutral';
  clickable?: boolean;
}>(), {
  clickable: true,
});

const emit = defineEmits<{
  preview: [];
}>();

const fallbackImage = require('@/assets/images/DefaultImage.png') as string;
const displaySrc = ref(props.src);

watch(() => props.src, (value) => {
    displaySrc.value = value;
});

function handleClick() {
    if (!props.clickable || !displaySrc.value) {
        return;
    }

    emit('preview');
}

function onImageError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (!target || target.src === fallbackImage) {
        return;
    }

    target.src = fallbackImage;
}
</script>

<style lang="scss" scoped>
.image-diff-thumb {
  width: 110px;
  height: 160px;
  overflow: hidden;
  padding: 0;
  border: none;
  background: transparent;

  &--clickable {
    cursor: zoom-in;
  }

  &--removed {
    background: #ffeef0;
  }

  &--added {
    background: #e6ffed;
  }

  &--neutral {
    background: #fafafa;
  }

  &--placeholder {
    cursor: default;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 8px;
    text-align: center;
    color: #79747E;
  }
}
</style>

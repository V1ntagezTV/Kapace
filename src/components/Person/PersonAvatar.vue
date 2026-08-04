<template>
  <div class="person-avatar">
    <div class="person-avatar__image-box m-radius-16">
      <image-zoom
        class="person-avatar__image"
        :src="props.imageLink"
        alt="Фото персоны"
        :thumbnail-fluid="true"
        :thumbnail-hover-scale="false"
        @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ImageZoom from '@/components/UseReadyComponents/ImageZoom.vue';

const props = defineProps({
  imageLink: { type: String, required: true },
});
</script>

<style lang="scss" scoped>
.person-avatar {
  width: 100%;
  min-width: 0;

  &__image-box {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    background-color: #f0f0f0;
  }

  &__image {
    width: 100%;
    display: block;
  }

  @media (max-width: 719px) {
    max-height: calc(100vh - 60px);
    max-height: calc(100dvh - 60px);

    &__image-box {
      max-height: inherit;
    }

    &__image {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      align-items: center;

      :deep(.thumbnail) {
        width: 100%;
        height: auto;
        max-width: 100%;
      }
    }
  }
}
</style>

<template>
  <BaseBackground
    class="theater-avatar m-radius-2"
    :type="2"
  >
    <image-zoom
      class="theater-avatar__image"
      :src="props.imageLink"
      alt="Изображение"
      :thumbnail-fluid="true"
      @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
    />
  </BaseBackground>
</template>

<script lang="ts" setup>
import {defineProps} from 'vue';
import BaseBackground from "@/components/Base/BaseBackground.vue";
import ImageZoom from "@/components/UseReadyComponents/ImageZoom.vue";

const props = defineProps({
  imageLink: {type: String, required: true}
})
</script>

<style lang="scss" scoped>
.theater-avatar {
  width: 100%;
  min-width: 0;
  overflow: hidden;

  &__image {
    width: 100%;
  }

  /*
   * Узкий экран:
   * — ширина 100%, высота по картинке;
   * — если выше одного экрана — обрезаем по max-height, показываем центр.
   */
  @media (max-width: 719px) {
    max-height: calc(100vh - 60px);
    max-height: calc(100dvh - 60px);
    display: flex;
    align-items: center;

    &__image {
      flex-shrink: 0;
      width: 100%;
      min-height: 0;

      :deep(.thumbnail) {
        width: 100%;
        height: auto;
        max-width: 100%;
      }
    }
  }
}
</style>

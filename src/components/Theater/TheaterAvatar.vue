<template>
  <BaseBackground
    class="image-column__main m-radius-2"
    :type="2"
  >
    <image-zoom
      class="image-column__image"
      :src="imageService.getImageLink(imageId, contentId)"
      alt="Изображение"
      @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
    />
  </BaseBackground>
</template>

<script lang="ts" setup>
import {defineProps, inject} from 'vue';
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {ImageService} from "@/api/ImageService";
import ImageZoom from "@/components/UseReadyComponents/ImageZoom.vue";

const imageService: ImageService = inject<ImageService>("image-service");

const props = defineProps({
  imageId: {type: Number, required: true},
  contentId: {type: Number, required: true}
})
</script>

<style lang="scss" scoped>
.image-column {
  &__main {
    display: flex;
    overflow: hidden;
  }

  &__image {
    display: flex;
    height: 100%;
    width: 100%;
  }

  &__start-watching {
    color: white;
  }
}
</style>
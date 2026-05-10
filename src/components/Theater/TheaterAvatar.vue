<template>
  <BaseBackground
    class="image-column__main m-radius-2"
    :type="2"
  >
    <image-zoom
      class="image-column__image"
      :src="props.imageLink"
      alt="Изображение"
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
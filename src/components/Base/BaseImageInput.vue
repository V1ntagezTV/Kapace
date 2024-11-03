<template>
  <div v-if="imageUrl != null" class="image-input__image-container">
    <img
      :src="imageUrl"
      class="image-input__image"
      alt="Выбранное изображение"
    >
  </div>

  <label v-else class="image-input__box image-input">
    <UploadArrow />
    <input
      ref="image"
      type="file"
      accept=".jpg, .jpeg, .png"
      alt="Выберите изображение"
      style="display:none;"
      @change="onChange"
    >
    Выберите изображение
  </label>
</template>

<script setup lang="ts">
import UploadArrow from "@/components/Icons/UploadArrow.vue";
import {ref} from "vue";
import {defineEmits} from "vue/dist/vue";


const emits = defineEmits<{
  (emitName: 'on:update', image: ArrayBufferLike) : void
}>()

const imageUrl = ref<string | null>(null)

function onChange(event) {
  imageUrl.value = URL.createObjectURL(event.target.files[0]);
  emits("on:update", event.target.files[0]);
}

</script>

<style lang="scss">
.image-input {
  &__box {
    padding: 20px;
    border-radius: 6px;
    transition: 0.25s;
    // https://kovart.github.io/dashed-border-generator/
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23AAA' stroke-width='2' stroke-dasharray='10%2c 8' stroke-dashoffset='46' stroke-linecap='round'/%3e%3c/svg%3e");
  }
  &:hover {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23577399FF' stroke-width='2' stroke-dasharray='10%2c 8' stroke-dashoffset='46' stroke-linecap='round'/%3e%3c/svg%3e");
  }

  &__image {
    width: 250px;
    max-width: max-content;
    border-radius: 6px;
  }

  &__image-container {
    width: available;
  }
}
</style>
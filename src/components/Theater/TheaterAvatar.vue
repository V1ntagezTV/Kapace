<template>
  <div class="image-column__main">
    <BaseBackground :type="2">
      <div>
        <img
          class="image-column__image"
          :src="require(`@/assets/${imageLink}`)"
        />
      </div>
    </BaseBackground>

    <BaseButton :button-type="2">
      Начать просмотр
    </BaseButton>

    <BaseButton :button-type="1">
      Добавить в
    </BaseButton>

    <BaseButton v-if="props.currentSeries" :button-type="3">
      Продолжить просмотр <br> с {{ props.currentSeries }}-ой серии
    </BaseButton>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, PropType} from 'vue';
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

const props = defineProps({
  imageLink: {type: String, required: true},
  currentSeries: {type: Number, required: true, default: null},
})

</script>

<style lang="scss" scoped>
.image-column {
  &__main {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__image {
    display: flex;
    height: 100%;
    width: 100%;
  }
}
</style>
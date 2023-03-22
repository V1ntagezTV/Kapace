<template>
  <BaseBackground
    v-if="props.videos.length > 0"
    :type="2"
    class="theater-videos__main"
  >
    <h2 class="theater-videos__title">
      Содержание
    </h2>

    <div class="theater-videos__videos-main ">
      <div
        v-for="video in props.videos"
        :key="video"
        class="theater-videos__videos-item"
      >
        <div class="theater-videos__video-image" />

        <BaseTextButton class="theater-videos__video-name">
          {{ video.id + " " + video.name }}
        </BaseTextButton>
      </div>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {PropType} from "vue";
import {VideoUnit} from "@/components/Theater/ViewModels/TheaterContent";

const props = defineProps({
  videos: {type: Object as PropType<VideoUnit[]>, required: true}
})
</script>

<style lang="scss" scoped>

.theater-videos {
  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: fit-content;
    gap: 20px;
    padding: 20px;
    align-items: start;
  }

  &__title {
    font-weight: 700;
    font-size: 16px;
    margin: 0;
  }

  &__videos-main {
    display: grid;
    width: 100%;
    grid-template-rows: repeat(1, 1fr);
    grid-template-columns: repeat(4, 1fr);
    column-gap: 15px;
    row-gap: 15px;
  }

  &__videos-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  &__videos-item {
    display: flex;
    flex-direction: column;
  }

  &__video-image {
    width: 100%;
    height: 110px;
    background-color: var(--dark-primary);
    border-radius: 6px;
    transition: border 0.1s;

    &:hover {
      border: 3px solid var(--secondary);
      cursor: pointer;
    }
  }

  &__video-name {
    display: flex;
    text-align: center;
    padding-top: 10px;
    padding-bottom: 6px;
    align-items: center;
  }
}

</style>
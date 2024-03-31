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
        <router-link
          :to="{ name: 'episode', params: { content: contentId, episode: video.Id }}"
          class="theater-videos__video-image"
        >
          <img :src="!StringExtensions.isNullOrEmpty(video.Image) ? video.Image : require('@/assets/images/DefaultImage.png')" />
        </router-link>

        <BaseTextButton>
          <router-link
            class="theater-videos__video-name"
            :to="{ name: 'episode', params: { content: contentId, episode: video.Id }}"
          >
            Серия {{ video.Number + ": " + video.Title }}
          </router-link>
        </BaseTextButton>
      </div>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {PropType} from "vue";
import {V1GetFullContentEpisode} from "@/api/Responses/V1GetFullContentResponse";
import {StringExtensions} from "@/helpers/StringExtensions";

const props = defineProps({
  contentId: {type: Number, required: true},
  videos: {type: Array as PropType<Array<V1GetFullContentEpisode>>, required: true}
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
    grid-template-columns: repeat(auto-fit, 180px);
    grid-auto-flow: dense;
    column-gap: 15px;
    row-gap: 15px;

    &:hover {
      color: var(--primary);
      cursor: pointer;
    }
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
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 100%;
    height: 110px;
    border-radius: 6px;
    transition: border 0.1s, width 0.25s;

    & img {
      transition: width 0.25s;
      width: 100%;

      &:hover {
        width: 105%;
      }
    }
  }

  &__video-name {
    display: flex;
    padding-top: 10px;
    padding-bottom: 6px;
    align-items: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: start;

    &:hover {
      color: var(--primary);
      cursor: pointer;
      text-decoration: underline;
    }
  }
}

</style>
Ё<template>
  <BaseBackground class="search-item__box" :type="3">
    <router-link :to="{ name: 'theater', params: { id: content.Id}}">
      <div class="search-item__image-box-1">
        <div
          v-if="content.MinAge || content.SeriesCounter"
          class="search-item__tags-box"
        >
          <div class="search-item__first-tags-box">
            <div v-if="content.MinAge" class="search-item__tag">
              <span class="label-medium">{{ content.MinAge }}+</span>
            </div>
            <div v-if="content.SeriesCounter" class="search-item__tag">
              <span class="label-medium">{{ content.SeriesCounter }}</span>
            </div>
          </div>

          <div class="row row-dynamic gap-8">
            <div
              v-for="lang in removeDuplicates(content.Translates)"
              :key="lang"
              class="search-item__tag"
            >
              <p class="label-medium">
                {{ lang }}
              </p>
            </div>
          </div>

        </div>
        <div class="search-item__image-box m-radius-16">
          <img
            class="search-item__image"
            :src="image"
            :alt="content.Title"
            @error="() => { image = require('@/assets/images/DefaultImage.png') }"
          >
        </div>
      </div>

      <div class="search-item__details-box">
        <BaseTextButton class="title-large search-item__title search-item__line-breaker">
          {{ content.Title }}
        </BaseTextButton>

        <a class="search-item__description search-item__line-breaker">
          {{ content.Description }}
        </a>

        <p v-if="content.Genres" class="search-item__genre search-item__line-breaker">
          {{ content.Genres }}
        </p>

        <button v-if="OptionsApi.HIDE_USER_ACTIVITIES" class="search-item__icon-button">
          <FavoriteIcon class="search-item__icon" />
        </button>
        <button v-if="OptionsApi.HIDE_USER_ACTIVITIES" class="search-item__icon-button">
          <DetailsIcon class="search-item__icon" />
        </button>
      </div>
    </router-link>
  </BaseBackground>
</template>

<script lang="ts" setup>
import {defineProps, inject, PropType, ref} from "vue";
import FavoriteIcon from "@/components/Icons/FavoriteIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import DetailsIcon from "@/components/Icons/DetailsIcon.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {OptionsApi} from "@/options/OptionsApi";
import {ImageService} from "@/api/ImageService";
import {SearchItemViewModel} from "@/components/Body/Search/ViewModels/SearchItemViewModel";

const props = defineProps({
  content: {type: Object as PropType<SearchItemViewModel>, required: true}
});

const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
}

const imageService: ImageService = inject<ImageService>("image-service");
const imageLink = imageService.getImageLink(props.content.ImageId, props.content.Id);
const image = ref<string>(imageLink);
</script>

<style lang="scss" scoped>
.search-item {
  &__first-tags-box {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  &__box {
    display: flex;
    background: var(--primary99);
    flex-direction: column;

    width: 100%;
    height: fit-content;

    overflow: hidden;
    border: none;
  }

  &__image-box-1 {
    display: grid;
    height: 350px;
    align-items: end;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  &__image-box {
    display: flex;
    height: 100%;
    width: auto;
    justify-content: center;
    align-items: center;

    overflow: hidden;

    grid-row-start: 1;
    grid-row-end: 3;
    grid-column-start: 1;
    grid-column-end: 3;
  }

  &__image {
    object-fit: cover;
    height: 100%;
    width: 100%;
  }

  &__details-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    gap: 8px;
    padding: 16px;
  }

  &__title {
    color: #474A57;
    -webkit-line-clamp: 2;

    &:hover {
      cursor: pointer;
      color: var(--secondary);
    }
  }

  &__line-breaker {
    text-align: start;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  &__description {
    font-weight: 500;
    font-size: 13px;
    text-align: left;
    letter-spacing: 0.02em;
    color: #474A57;
    -webkit-line-clamp: 2;
  }

  &__genre {
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    -webkit-line-clamp: 1;
    color: #969BAB;
  }

  &__tag {
    width: fit-content;
    color: white;
    background: var(--primary40);
    border-radius: 4px;
    padding: 4px 8px;
  }

  &__tags-box {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    z-index: 1;
    overflow: hidden;
    height: fit-content;
    gap: 8px;
    padding: 16px;

    grid-row-start: 2;
    grid-row-end: 3;
    grid-column-start: 1;
    grid-column-end: 3;
  }

  &__icon {
    height: 22px;
    width: 22px;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;

    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 3;
  }

  &__icon-button {
    display: grid;
    height: 32px;
    width: 32px;
    align-self: center;
    justify-self: center;
    text-decoration: none;
    border-radius: 4px;
    border: 1.5px solid var(--font-gray-v1);
    background: var(--white);
    color: #9D9D9D;
    transition: color 0.1s;

    &:hover {
      cursor: pointer;
      border-radius: 4px;
      color: #577399;
      border: 1.5px solid #93B0D9;
    }

    & svg {
      height: 18px;
      width: 18px;
      justify-self: center;
      align-self: center;
    }
  }

  &__langs {
    display: flex;
    width: 100%;
    flex-direction: row;
    gap: 8px;
  }
}

</style>




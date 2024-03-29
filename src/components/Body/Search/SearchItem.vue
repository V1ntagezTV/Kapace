<template>
  <BaseBackground
    :type="3"
    class="search-item__container"
  >
    <router-link
      :to="{ name: 'theater', params: { id: item.Id}}"
      class="search-item__image-wrapper"
    >
      <img
        class="search-item__image"
        :src="image"
        :alt="viewModel.Title"
        @error="() => { image = require('@/assets/images/DefaultImage.png') }"
      >
    </router-link>

    <div class="search-item__details-container">
      <div class="search-item__details">
        <div class="search-item__title-container">
          <router-link :to="{ name: 'theater', params: { id: item.Id}}">
            <BaseTextButton class="search-item__title search-item__line-breaker">
              {{ viewModel.Title }}
            </BaseTextButton>
          </router-link>
        </div>

        <a class="search-item__description search-item__line-breaker">
          {{ viewModel.Description }}
        </a>

        <p v-if="viewModel.Genres" class="search-item__genre search-item__line-breaker">
          {{ viewModel.Genres }}
        </p>

        <div class="search-item__language-container">
          <div
            v-for="lang in viewModel.Translates"
            :key="lang"
            class="search-item__language-unit"
          >
            <p class="search-item__language">
              {{ lang }}
            </p>
          </div>
        </div>
      </div>

      <div class="search-item__buttons">
        <div v-if="viewModel.MinAge" class="search-item__min-age-container">
          <span class="search-item__min-age">{{ viewModel.MinAge }}+</span>
        </div>
        <div v-if="viewModel.SeriesCounter" class="search-item__min-age-container">
          <span class="search-item__min-age">{{ viewModel.SeriesCounter }}</span>
        </div>
        <button v-if="OptionsApi.HIDE_USER_ACTIVITIES" class="search-item__icon-button">
          <FavoriteIcon class="search-item__icon" />
        </button>
        <button v-if="OptionsApi.HIDE_USER_ACTIVITIES" class="search-item__icon-button">
          <DetailsIcon class="search-item__icon" />
        </button>
      </div>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import {defineProps, inject, PropType, ref} from "vue";
import FavoriteIcon from "@/components/Icons/FavoriteIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import DetailsIcon from "@/components/Icons/DetailsIcon.vue";
import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import moment from "moment/moment";
import {Country} from "@/api/Enums/Country";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {OptionsApi} from "@/options/OptionsApi";
import {ImageService} from "@/api/ImageService";
import {SearchItemViewModel} from "@/components/Body/Search/ViewModels/SearchItemViewModel";

const imageService: ImageService = inject<ImageService>("image-service");

const props = defineProps({
  item: {type: Object as PropType<V1GetByQueryResponseContent>, required: true}
});

let viewModel: SearchItemViewModel = getItemViewModel(props.item);
const image = ref(viewModel.Image);

function getItemViewModel(item: V1GetByQueryResponseContent): SearchItemViewModel {
  let description: string[] = [];

  if (item.ReleasedAt) {
    description.push(moment(new Date(item.ReleasedAt)).format('YYYY'));
  }
  if (item.EngTitle) {
    description.push(item.EngTitle);
  }

  if (item.Country && item.Country.toString() != Country.Null.toString()) {
    description.push(item.Country.toString())
  }

  let seriesCounter = '';
  if (item.PlannedSeries > 0) {
    seriesCounter = item.PlannedSeries.toString();
  }

  if (item.OutSeries > 0) {
    seriesCounter = item.OutSeries + '/' + seriesCounter;
  }

  let image: string = imageService.getImageLink(item.ImageId, item.Id);

  return {
    Image: image,
    Title: item.Title,
    Description: description.join(' / '),
    Translates: item.Translations.map(x => x.Language.toString()),
    Genres: item.Genres.map(x => x.Name).join(' '),
    MinAge: item.MinAgeLimit >= 0 ? item.MinAgeLimit : null,
    SeriesCounter: seriesCounter
  };
}
</script>

<style lang="scss" scoped>

.search-item {

  &__image-wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
    height: 100%;
    min-width: 117px;
    max-width: 117px;
    overflow: hidden;
    background: #112D3D;
  }

  &__image {
    object-fit: cover;
    height: 100%;
    display: flex;
    align-self: center;
    justify-self: center;
    transition: width 0.25s, height 0.25s;

    &:hover {
      height: 110%;
      width: 110%;
    }
  }

  &__image-container {
    width: 100%;
    min-width: 117px;
    max-width: 117px;
    height: fit-content;
  }

  &__details-container {
    height: 100%;
    width: 100%;
    justify-content: space-between;

    gap: 6px;
    display: flex;
    flex-direction: row;
    padding: 12px 12px;
  }

  &__container {
    display: flex;
    flex-direction: row;

    width: 100%;
    height: 165px;
    overflow: hidden;
    transition: border 0.25s;

    &:hover {
      border: 1.5px solid var(--font-gray-v4);
    }
  }

  &__details {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: start;
    gap: 6px;

    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 1;
    grid-column-end: 2;

    p {
      padding: 0;
      margin: 0;
    }
  }

  &__title-container {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: flex-start;
    justify-items: left;
  }

  &__title {
    font-style: normal;
    font-weight: 900;
    font-size: 18px;
    color: #474A57;
    -webkit-line-clamp: 2;

    &:hover {
      cursor: pointer;
      text-decoration: underline;
      color: var(--secondary);
    }
  }

  &__line-breaker {
    letter-spacing: 0.02em;
    text-align: start;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  

  &__min-age-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: fit-content;

    padding: 4px;
    gap: 12px;
    border-radius: 4px;
    background: #474A57;
  }

  &__min-age {
    font-weight: 500;
    font-size: 12px;
    color: white;
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

  &__language {
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    letter-spacing: 0.02em;
    color: white;
  }

  &__language-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow: hidden;
    width: 100%;
    height: 23px;
    gap: 8px;
  }

  &__language-unit {
    width: fit-content;
    background: #577399;
    border-radius: 4px;
    padding: 4px 8px;
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
}

</style>




<template>
  <BaseBackground class="search-item__box" :type="3">
    <router-link :to="{ name: 'theater', params: { id: item.Id}}">
      <div
        class="search-item__image-box"
      >
        <img
          class="search-item__image"
          :src="image"
          :alt="viewModel.Title"
          @error="() => { image = require('@/assets/images/DefaultImage.png') }"
        >
      </div>

      <div class="search-item__details-box">
        <div
          v-if="viewModel.Translates !== null && viewModel.Translates.length > 0"
          class="search-item__tags-box"
        >
          <div v-if="viewModel.MinAge" class="search-item__language-unit">
            <span class="label-medium search-item__tag">{{ viewModel.MinAge }}+</span>
          </div>
          <div v-if="viewModel.SeriesCounter" class="search-item__language-unit">
            <span class="label-medium search-item__tag">{{ viewModel.SeriesCounter }}</span>
          </div>
          <div
            v-for="lang in viewModel.Translates"
            :key="lang"
            class="search-item__language-unit"
          >
            <p class="label-medium search-item__tag">
              {{ lang }}
            </p>
          </div>
        </div>

        <div class="search-item__title-container">
          <BaseTextButton class="search-item__title search-item__line-breaker">
            {{ viewModel.Title }}
          </BaseTextButton>
        </div>

        <a class="search-item__description search-item__line-breaker">
          {{ viewModel.Description }}
        </a>

        <p v-if="viewModel.Genres" class="search-item__genre search-item__line-breaker">
          {{ viewModel.Genres }}
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
import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import moment from "moment/moment";
import {Country} from "@/api/Enums/Country";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {OptionsApi} from "@/options/OptionsApi";
import {ImageService} from "@/api/ImageService";
import {SearchItemViewModel} from "@/components/Body/Search/ViewModels/SearchItemViewModel";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";

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
  &__box {
    display: flex;
    flex-direction: column;

    width: 100%;
    height: fit-content;

    overflow: hidden;
    border: none;
  }

  &__image-box {
    display: flex;
    justify-content: center;
    align-content: center;
    width: 100%;
    min-height: 300px;
    max-height: 350px;
    overflow: hidden;
    background: #112D3D;
  }

  &__image {
    object-fit: cover;
    width: 100%;
    min-height: 300px;
    max-height: 350px;
    display: flex;
    align-self: center;
    justify-self: center;
    transition: width 0.25s, height 0.25s;
  }

  &__image-container {
    width: 100%;
    min-width: 120px;
    max-width: 120px;
    height: fit-content;
  }

  &__details-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    gap: 8px;
    padding: 16px;
  }

  &__details {

    gap: 8px;
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

  &__tag {
    color: white;
  }

  &__tags-box {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow: hidden;
    width: 100%;
    gap: 8px;
  }

  &__language-unit {
    width: fit-content;
    background: var(--primary40);
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




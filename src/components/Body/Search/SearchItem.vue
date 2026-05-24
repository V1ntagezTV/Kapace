<template>
  <BaseBackground class="search-item__box" :type="3">
    <router-link :to="{ name: 'theater', params: { id: content.Id}}">
      <div class="search-item__image-box-1">
        <button
          class="search-item__favorite-button"
          type="button"
          aria-label="Добавить в избранное"
          @click.stop.prevent="toggleFavorite"
        >
          <HeartSVG
            class="search-item__favorite-icon"
            :is-selected="isInFavorites"
          />
        </button>

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
import {defineProps, inject, PropType, ref, watch} from "vue";
import FavoriteIcon from "@/components/Icons/FavoriteIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import DetailsIcon from "@/components/Icons/DetailsIcon.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {OptionsApi} from "@/options/OptionsApi";
import {SearchItemViewModel} from "@/components/Body/Search/ViewModels/SearchItemViewModel";
import HeartSVG from "@/components/Icons/HeartSVG.vue";
import {FavoriteApi} from "@/api/FavoriteApi";
import {FavoriteStatus} from "@/models/FavoriteStatuses";
import {userStore} from "@/store/UserStore";
import {useRouter} from "vue-router";

const props = defineProps({
  content: {type: Object as PropType<SearchItemViewModel>, required: true}
});
const user = userStore();
const router = useRouter();
const favoritesApi = inject<FavoriteApi | null>("favorite-api", null);
const isInFavorites = ref(props.content.IsInFavorites ?? false);

const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
}

const image = ref<string>(props.content.AvatarImageLink);

watch(
  () => props.content.AvatarImageLink,
  (value) => {
    image.value = value;
  }
);

watch(
  () => [props.content.Id, props.content.IsInFavorites] as const,
  () => {
    isInFavorites.value = props.content.IsInFavorites ?? false;
  }
);

async function toggleFavorite() {
  if (!user.loggedIn) {
    await router.push('/login');
    return;
  }

  if (!favoritesApi) {
    return;
  }

  if (isInFavorites.value) {
    await favoritesApi.setStatus(props.content.Id, null);
    isInFavorites.value = false;
    return;
  }

  await favoritesApi.setStatus(props.content.Id, FavoriteStatus.Stash);
  isInFavorites.value = true;
}
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

  &__favorite-button {
    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 1;
    grid-column-end: 2;
    justify-self: end;
    align-self: start;
    z-index: 2;

    margin: 12px;
    padding: 8px;

    border: none;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);

    display: inline-flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s ease;

    &:hover {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.7);
    }
  }

  &__favorite-icon {
    width: 20px;
    height: 20px;
    color: white;
  }

  :deep(.search-item__favorite-icon.not-selected path) {
    --active-stroke: rgba(255, 255, 255, 0.9) !important;
    --active-fill: transparent !important;
  }

  :deep(.search-item__favorite-icon.not-selected:hover path) {
    --active-stroke: white !important;
    --active-fill: rgba(255, 255, 255, 0.08) !important;
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
    background: rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    padding: 4px 8px;
    backdrop-filter: blur(2px);
  }

  &__tags-box {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    z-index: 1;
    overflow: hidden;
    height: fit-content;
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




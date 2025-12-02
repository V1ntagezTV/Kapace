<template>
  <div class="material theater__main">
    <div class="column gap-16">
      <TheaterAvatar
        v-if="isDataReady && details"
        :image-id="details.Content.ImageId"
        :content-id="details.Content.Id"
        :user-info="details.UserInfo"
      />

      <base-button
        v-show="startWatchEpisodeId !== -1"
        v-if="isDataReady && details"
        class="m-radius-circle body-medium"
        :variant="'filled'"
        @click="() => router.push(
          {
            name: 'episode',
            params: {
              content: details.Content.Id,
              episode: startWatchEpisodeId
            }
          })"
      >
        Начать просмотр
      </base-button>

      <base-selector
        v-show="user.loggedIn"
        v-model="userFavoriteStatus"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="[
          FavoriteStatuses.Loved,
          FavoriteStatuses.Planned,
          FavoriteStatuses.Watching,
          FavoriteStatuses.Paused,
          FavoriteStatuses.Finished,
          FavoriteStatuses.Dropped,
        ]"
        class="m3-bg-1 m-border m-border-hover m-border-active m-radius-circle"
        :class="{'theater__favorite-active': userFavoriteStatus !== 'Добавить в избранное'}"
        @update:model-value="async (value) => await addToFavorites(value)"
      />

      <base-background class="theater__short-box column gap-8" :type="2">
        <template
          v-for="([key, value], index) in tags"
          :key="index"
        >
          <div class="row space-between">
            <p class="label-large theater__tag-name">
              {{ key }}
            </p>
            <p class=" theater__tag-value">
              {{ value }}
            </p>
          </div>
        </template>
      </base-background>

      <base-button
        class="m-border-primary m-radius-circle"
        :variant="'outline'"
        @click="() => router.push({name: 'edit-episode', params: {content: +route.params.id}})"
      >
        Добавить серию
      </base-button>

      <base-button
        class="m-border-primary m-radius-circle"
        :variant="'outline'"
        @click="() => router.push({name: 'edit-content', params: {content: +route.params.id}})"
      >
        Редактировать
      </base-button>
    </div>

    <div class="theater__body">
      <theater-details
        v-if="isDataReady"
        :details="details"
        :is-favorite="isInFavorites"
        @on:click-heart="heartOnClick"
      />
      <album-images v-if="myImages.length > 0" :images="myImages" />
      <stars-rate-component
        v-if="isDataReady"
        class="h__center"
        :stars="details.StarsAggregates.Stars"
        :one="details.StarsAggregates.One"
        :two="details.StarsAggregates.Two"
        :three="details.StarsAggregates.Three"
        :four="details.StarsAggregates.Four"
        :five="details.StarsAggregates.Five"
        :user-rate="userStars"
        @on:click-star="(starIndex) => clickOnStar(starIndex)"
      />
      <translations-list-component-v2
        v-if="isDataReady"
        :translators="mapToTranslators(episodeTranslations.Translators)"
        :episodes-total-count="0"
        :episodes="episodes"
        :content-id="contentId"
        @translator:update="(value) => {
          episodesListParams.translator.value = value;
          updateEpisodesList();
        }"
        @sort-by:update="(value) => {
          episodesListParams.sortBy.value = value;
          updateEpisodesList();
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router'
import TheaterDetails from "@/components/Theater/TheaterDetails.vue";
import {inject, onMounted, ref} from "vue";
import TheaterAvatar from "@/components/Theater/TheaterAvatar.vue";
import {V1GetFullContentEpisode, V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {ContentService} from "@/api/ContentService";
import moment from "moment/moment";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import TranslationsListComponentV2 from "@/components/UseReadyComponents/EpisodesList/TranslationsListComponentV2.vue";
import {
  ALL_FILTER,
  mapToEpisodeOrderType,
  mapToEpisodes,
  mapToTranslators,
  Order,
  Translation
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

import {V1GetByEpisodeResponse} from "@/api/Responses/V1GetByEpisodeResponse";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {TranslationService} from "@/api/TranslationService";
import {FavoriteApi} from "@/api/FavoriteApi";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import {FavoriteStatus, FavoriteStatuses, getFavoritesStatusKeyByValue} from "@/models/FavoriteStatuses";
import {userStore} from "@/store/UserStore";
import StarsRateComponent from "@/components/UseReadyComponents/StarsRateComponent.vue";
import {ImageService} from "@/api/ImageService";
import AlbumImages from "@/components/UseReadyComponents/AlbumImages.vue";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const user = userStore();
const router = useRouter();
const route = useRoute();
const contentId = ref(+route.params.id);
const contentService: ContentService = inject("content-service");
const translationService: TranslationService = inject('translation-service');
const favoritesApi: FavoriteApi = inject('favorite-api');
const imageService: ImageService = inject<ImageService>("image-service");

const userStars = ref<number>(0);
const startWatchEpisodeId = ref<number>();
const isDataReady = ref(false);
const details = ref<V1GetFullContentResponse>(null);
const tags = ref<Map<string, string | number>>();

let episodeTranslations = ref<V1GetByEpisodeResponse>(null);
let episodes: Translation[] = [];
const episodesListParams = {
  translator: ref<string>(),
  sortBy: ref<string>(Order.ByNumber)
};
const isInFavorites = ref<boolean>(false);
const userFavoriteStatus = ref<FavoriteStatuses | null>("Добавить в избранное");
const myImages = ref<{}>([]);

onMounted(async() => {
  isDataReady.value = false;
  details.value = await contentService.V1GetById(contentId.value);
  await contentService.incrementViews(details.value.Content.Id);
  tags.value = getTagsFromDetails(details.value);
  startWatchEpisodeId.value = getFirstEpisodeIdOrDefault(details.value.Episodes);

  myImages.value = [
    // TODO: Заполнить изображениями после реализации
  ];
  await updateEpisodesList();

  if (userStore().loggedIn && details.value.UserInfo !== null) {
    isInFavorites.value = details.value.UserInfo.FavouriteStatus !== null;
    userFavoriteStatus.value =
      details.value.UserInfo.FavouriteStatus === null ?
        "Добавить в избранное":
        FavoriteStatuses[details.value.UserInfo.FavouriteStatus as keyof typeof FavoriteStatuses];
    userStars.value = details.value.UserInfo.Stars;
  } else {
    isInFavorites.value = false;
  }

  isDataReady.value = true;
});

async function heartOnClick() {
  if (isInFavorites.value) {
    await favoritesApi.setStatus(contentId.value, null);
    isInFavorites.value = false;
    userFavoriteStatus.value = "Добавить в избранное"
    return;
  }

  await favoritesApi.setStatus(contentId.value, FavoriteStatus.Stash);
  userFavoriteStatus.value = FavoriteStatuses.Stash;
  isInFavorites.value = true;
}

async function clickOnStar(starIndex: number) {
  if (!user.loggedIn) {
    await router.push('/login');
    return;
  }

  await favoritesApi.setStars(details.value.Content.Id, starIndex);
  userStars.value = starIndex;
}

async function addToFavorites(favoriteStatusStr: string) {
  const favoriteStatus = getFavoritesStatusKeyByValue(favoriteStatusStr) as FavoriteStatus;
  await favoritesApi.setStatus(contentId.value, favoriteStatus);

  isInFavorites.value = true;
}

async function updateEpisodesList() {
  let translatorId = null
  if (episodesListParams.translator.value) {
    if (episodesListParams.translator.value === ALL_FILTER) {
      translatorId = null;
    } else {
      const translator = episodeTranslations.value.Translators.find(x => x.Name === episodesListParams.translator.value);
      if (translator !== undefined) {
        translatorId = translator.Id;
      }
    }
  }

  const request = new V1GetByEpisodeRequest(
    contentId.value,
    null,
    translatorId,
    mapToEpisodeOrderType(episodesListParams.sortBy.value as Order)
  );

  episodeTranslations.value = await translationService.V1GetByEpisodeAsync(request);
  episodes = mapToEpisodes(episodeTranslations.value.Episodes);
}

function getFirstEpisodeIdOrDefault(episodes: V1GetFullContentEpisode[]) {
  // Значение по умолчанию приводит к скрытию кнопки "Начать просмотр"
  const defaultValue = -1;
  return !episodes || episodes.length <= 0 ? defaultValue : episodes[0].Id;
}

function getTagsFromDetails(details: V1GetFullContentResponse) : Map<string, string | number> {
  if (details == null) {
    return new Map<string, string | number>();
  }

  const hoursStr = Math.floor(details.Content.Duration / 60) > 0
    ? `${Math.floor(details.Content.Duration / 60)} ч`
    : ""

  const minStr = details.Content.Duration % 60 > 0 ? `${details.Content.Duration % 60} мин` : '';
  const formattedDuration = `${hoursStr} ${minStr}`;

  const resultMap = new Map<string, string | number>();

  resultMap.set("Серий", details.Content.OutSeries + "/" + details.Content.PlannedSeries);
  if (details.Content.Views > 0) {
    resultMap.set("Просмотров", details.Content.Views);
  }
  if (details.Content.Duration) {
    resultMap.set("Длительность", formattedDuration);
  }
  const updatedAtDate = moment(new Date(details.Content.LastUpdateAt));
  resultMap.set("Обновлено", updatedAtDate.day() + ` ${months[updatedAtDate.month() - 1]} ` + updatedAtDate.format(`YYYY в HH:MM`));
  const createdAtDate = moment(new Date(details.Content.CreatedAt));
  resultMap.set("Создано", createdAtDate.day() + ` ${months[createdAtDate.month() - 1]} ` + createdAtDate.format(`YYYY в HH:MM`));

  return resultMap;
}
</script>

<style scoped lang="scss">
.theater {
  @media (min-width: 0px) {
    &__main {
      display: grid;
      margin: 20px 0;
    }
  }
  @media (min-width: 720px) {
    &__main {
      display: grid;
      grid-template-columns: 255px 1fr;
      gap: 20px;
      margin: 20px 0;
    }
  }

  &__favorite-active {
    border: 1px solid var(--primary40);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__tag-name {
    display: flex;
    color: #969BAB;
    margin: 0;
  }

  &__tag-value {
    margin: 0;
  }

  &__short-box {
    display: grid;
    padding: 16px;
  }
}
</style>
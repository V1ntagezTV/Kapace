<template>
  <div class="theater">
    <!-- Левая колонка (Сайдбар) -->
    <div class="theater__sidebar column gap-16">
      <TheaterAvatar
        v-if="isDataReady && details"
        :image-id="details.Content.ImageId"
        :content-id="details.Content.Id"
        :user-info="details.UserInfo"
      />

      <base-button
        v-if="isDataReady && details"
        v-show="startWatchEpisodeId !== -1"
        class="m-radius-circle body-medium"
        variant="filled"
        @click="navigateToEpisode"
      >
        Начать просмотр
      </base-button>

      <base-selector
        v-show="user.loggedIn"
        v-model="userFavoriteStatus"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="favoriteValues"
        class="m3-bg-1 m-border m-border-hover m-border-active m-radius-circle theater__favorite-selector"
        :class="{'theater__favorite-selector--active': userFavoriteStatus !== 'Добавить в избранное'}"
        @update:model-value="addToFavorites"
      />

      <base-background class="theater__tags column gap-8" :type="2">
        <div
          v-for="([key, value], index) in tags"
          :key="index"
          class="theater__tag-row row space-between"
        >
          <p class="label-large theater__tag-label">
            {{ key }}
          </p>
          <p class="theater__tag-value">
            {{ value }}
          </p>
        </div>
      </base-background>

      <base-button
        class="m-border-primary m-radius-circle"
        variant="outline"
        @click="router.push({name: 'edit-episode', params: {content: contentId}})"
      >
        Добавить серию
      </base-button>

      <base-button
        class="m-border-primary m-radius-circle"
        variant="outline"
        @click="router.push({name: 'edit-content', params: {content: contentId}})"
      >
        Редактировать
      </base-button>
    </div>

    <!-- Правая колонка (Контент) -->
    <div class="theater__content">
      <theater-details
        v-if="isDataReady"
        :details="details"
        :is-favorite="isInFavorites"
        @on:click-heart="heartOnClick"
      />

      <album-images
        v-if="myImages.length > 0"
        :images="myImages"
      />

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
        @on:click-star="clickOnStar"
      />

      <translations-list-component-v3
        v-if="isDataReady"
        :content-id="contentId"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from 'vue-router';
import moment from "moment/moment";

// Components
import TheaterDetails from "@/components/Theater/TheaterDetails.vue";
import TheaterAvatar from "@/components/Theater/TheaterAvatar.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import StarsRateComponent from "@/components/UseReadyComponents/StarsRateComponent.vue";
import AlbumImages from "@/components/UseReadyComponents/AlbumImages.vue";
import TranslationsListComponentV3 from "@/components/UseReadyComponents/EpisodesList/TranslationsListComponentV3.vue";

// APIs & Services
import { ContentService } from "@/api/ContentService";
import { FavoriteApi } from "@/api/FavoriteApi";
import { ImageService } from "@/api/ImageService"; // Оставлено, так как используется (хоть и для пустого массива пока)
import { userStore } from "@/store/UserStore";

// Models & Enums
import { V1GetFullContentEpisode, V1GetFullContentResponse } from "@/api/Responses/V1GetFullContentResponse";
import { MenuAlignment } from "@/components/Base/Selector/Internal/MenuAlignment";
import { FavoriteStatus, FavoriteStatuses, getFavoritesStatusKeyByValue } from "@/models/FavoriteStatuses";

// --- Setup ---
const user = userStore();
const router = useRouter();
const route = useRoute();

// Services
const contentService = inject<ContentService>("content-service")!;
const favoritesApi = inject<FavoriteApi>('favorite-api')!;
const imageService = inject<ImageService>("image-service")!;

// State
const contentId = ref<number>(+route.params.id);
const isDataReady = ref(false);
const details = ref<V1GetFullContentResponse | null>(null);
const tags = ref<Map<string, string | number>>(new Map());
const startWatchEpisodeId = ref<number>(-1);
const myImages = ref<any[]>([]);

// Favorites & Rating State
const isInFavorites = ref<boolean>(false);
const userFavoriteStatus = ref<string>("Добавить в избранное");
const userStars = ref<number>(0);

const favoriteValues = [
  FavoriteStatuses.Loved,
  FavoriteStatuses.Planned,
  FavoriteStatuses.Watching,
  FavoriteStatuses.Paused,
  FavoriteStatuses.Finished,
  FavoriteStatuses.Dropped,
];

// --- Lifecycle ---
onMounted(async () => {
  isDataReady.value = false;

  try {
    details.value = await contentService.V1GetById(contentId.value);

    // Async tasks parallel execution where possible
    await Promise.all([
      contentService.incrementViews(details.value.Content.Id),
      // Загрузка картинок (пока пустая)
      Promise.resolve().then(() => { myImages.value = []; })
    ]);

    tags.value = getTagsFromDetails(details.value);
    startWatchEpisodeId.value = getFirstEpisodeIdOrDefault(details.value.Episodes);

    if (user.loggedIn && details.value.UserInfo) {
      const status = details.value.UserInfo.FavouriteStatus;
      isInFavorites.value = status !== null;
      userFavoriteStatus.value = status === null
        ? "Добавить в избранное"
        : FavoriteStatuses[status as keyof typeof FavoriteStatuses];
      userStars.value = details.value.UserInfo.Stars;
    } else {
      isInFavorites.value = false;
    }
  } catch (e) {
    console.error("Failed to load theater details", e);
  } finally {
    isDataReady.value = true;
  }
});

// --- Methods ---

function navigateToEpisode() {
  router.push({
    name: 'episode',
    params: {
      content: details.value?.Content.Id,
      episode: startWatchEpisodeId.value
    }
  });
}

async function heartOnClick() {
  if (!details.value) return;

  if (isInFavorites.value) {
    await favoritesApi.setStatus(contentId.value, null);
    isInFavorites.value = false;
    userFavoriteStatus.value = "Добавить в избранное";
  } else {
    await favoritesApi.setStatus(contentId.value, FavoriteStatus.Stash);
    userFavoriteStatus.value = FavoriteStatuses.Stash;
    isInFavorites.value = true;
  }
}

async function clickOnStar(starIndex: number) {
  if (!user.loggedIn) {
    await router.push('/login');
    return;
  }
  if (!details.value) return;

  await favoritesApi.setStars(details.value.Content.Id, starIndex);
  userStars.value = starIndex;
}

async function addToFavorites(favoriteStatusStr: string) {
  const favoriteStatus = getFavoritesStatusKeyByValue(favoriteStatusStr) as FavoriteStatus;
  await favoritesApi.setStatus(contentId.value, favoriteStatus);
  isInFavorites.value = true;
}

function getFirstEpisodeIdOrDefault(episodes: V1GetFullContentEpisode[] | null): number {
  return (!episodes || episodes.length <= 0) ? -1 : episodes[0].Id;
}

function getTagsFromDetails(data: V1GetFullContentResponse): Map<string, string | number> {
  const map = new Map<string, string | number>();
  if (!data) return map;

  const { Content } = data;

  // Duration formatting
  const hours = Math.floor(Content.Duration / 60);
  const mins = Content.Duration % 60;
  const durationStr = (hours > 0 ? `${hours} ч ` : "") + (mins > 0 ? `${mins} мин` : "");

  map.set("Серий", `${Content.OutSeries}/${Content.PlannedSeries}`);
  if (Content.Views > 0) map.set("Просмотров", Content.Views);
  if (durationStr) map.set("Длительность", durationStr.trim());

  // Date formatting using moment correctly
  moment.locale('ru'); // Ensure locale if needed, or rely on global config
  const updateDate = moment(Content.LastUpdateAt);
  const createDate = moment(Content.CreatedAt);

  // Формат: Чт Aug 2023 в 14:30 (как было в оригинале, но через moment)
  // Оригинальный код использовал names[month-1], что было багом для января.
  map.set("Обновлено", updateDate.format('ddd MMM YYYY в HH:mm'));
  map.set("Создано", createDate.format('ddd MMM YYYY в HH:mm'));

  return map;
}
</script>

<style scoped lang="scss">
.theater {
  display: grid;
  margin: 20px 0;
  gap: 20px;

  /* Mobile first: 1 колонка */
  grid-template-columns: 1fr;

  /* Desktop: 2 колонки */
  @media (min-width: 720px) {
    grid-template-columns: 255px 1fr;
  }

  &__sidebar {
    /* column и gap-16 из глобальных утилит */
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__favorite-selector {
    /* Базовые стили селектора наследуются из классов утилит */

    &--active {
      border: 1px solid var(--primary40);
    }
  }

  &__tags {
    display: grid;
    padding: 16px;
  }

  &__tag-row {
    /* row и space-between из утилит */
  }

  &__tag-label {
    display: flex;
    color: #969BAB;
    margin: 0;
  }

  &__tag-value {
    margin: 0;
  }
}
</style>
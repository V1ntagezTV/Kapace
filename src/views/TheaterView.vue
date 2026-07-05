<template>
  <div class="theater">
    <!-- Левая колонка (Сайдбар) -->
    <div class="theater__sidebar column gap-16">
      <TheaterAvatar
        v-if="isDataReady && details"
        :image-link="resolveBackendImageLink(details.Content.AvatarImageLink)"
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
        :class="{'theater__favorite-selector--active': userFavoriteStatus !== DEFAULT_FAVORITE_STATUS}"
        @update:model-value="addToFavorites"
      />

      <base-background class="theater__meta" :type="2">
        <div
          v-for="item in metaItems"
          :key="item.id"
          class="theater__meta-item"
          :class="{ 'theater__meta-item--stacked': item.id === 'updated' || item.id === 'created' }"
        >
          <div class="theater__meta-main">
            <component :is="item.icon" class="theater__meta-icon" />
            <p class="label-large theater__meta-label">
              {{ item.label }}
            </p>
          </div>
          <p class="theater__meta-value">
            {{ item.value }}
          </p>
        </div>
      </base-background>

      <base-button
        class="m-border-primary m-radius-circle"
        variant="outline"
        @click="router.push({name: 'edit-episode-prefill', params: {content: contentId}})"
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

      <base-button
        class="m-border-primary m-radius-circle"
        variant="outline"
        @click="router.push({ name: 'content-history', params: { id: contentId } })"
      >
        История
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
import { inject, onMounted, ref, watch, type Component } from "vue";
import { useRoute, useRouter } from 'vue-router';

// Components
import TheaterDetails from "@/components/Theater/TheaterDetails.vue";
import TheaterAvatar from "@/components/Theater/TheaterAvatar.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import StarsRateComponent from "@/components/UseReadyComponents/StarsRateComponent.vue";
import AlbumImages from "@/components/UseReadyComponents/AlbumImages.vue";
import TranslationsListComponentV3 from "@/components/UseReadyComponents/EpisodesList/TranslationsListComponentV3.vue";
import AddLibraryIcon from "@/components/Icons/AddLibraryIcon.vue";
import EyeIcon from "@/components/Icons/MaterialIcons/Eye.vue";
import LoopIcon from "@/components/Icons/LoopIcon.vue";
import CalendarIcon from "@/components/Icons/Calendar.vue";

// APIs & Services
import { ContentService } from "@/api/ContentService";
import { FavoriteApi } from "@/api/FavoriteApi";
import { userStore } from "@/store/UserStore";

// Models & Enums
import { V1GetFullContentEpisode, V1GetFullContentResponse } from "@/api/Responses/V1GetFullContentResponse";
import { MenuAlignment } from "@/components/Base/Selector/Internal/MenuAlignment";
import { FavoriteStatus, FavoriteStatuses, getFavoritesStatusKeyByValue } from "@/models/FavoriteStatuses";
import { resolveBackendImageLink, resolveBackendImageLinks } from "@/helpers/ImageLinkResolver";

// --- Setup ---
const user = userStore();
const router = useRouter();
const route = useRoute();

// Services
const contentService = inject<ContentService>("content-service")!;
const favoritesApi = inject<FavoriteApi>('favorite-api')!;

// State
const contentId = ref<string>(resolveRouteContentId());
const DEFAULT_FAVORITE_STATUS = "Добавить в избранное";
const isDataReady = ref(false);
const details = ref<V1GetFullContentResponse | null>(null);
const metaItems = ref<TheaterMetaItem[]>([]);
const startWatchEpisodeId = ref<number>(-1);
const myImages = ref<{ src: string; alt: string }[]>([]);

// Favorites & Rating State
const isInFavorites = ref<boolean>(false);
const userFavoriteStatus = ref<string>(DEFAULT_FAVORITE_STATUS);
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
      contentService.incrementViews(contentId.value),
      Promise.resolve().then(() => {
        const content = details.value?.Content;
        myImages.value = resolveBackendImageLinks(content?.Images).map((src, index) => ({
          src,
          alt: `${content?.Title ?? "Контент"} #${index + 1}`
        }));
      })
    ]);

    metaItems.value = getMetaItemsFromDetails(details.value);
    startWatchEpisodeId.value = getFirstEpisodeIdOrDefault(details.value.Episodes);

    if (user.loggedIn && details.value.UserInfo) {
      const status = details.value.UserInfo.FavouriteStatus;
      isInFavorites.value = status !== null;
      userFavoriteStatus.value = status === null
        ? DEFAULT_FAVORITE_STATUS
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

watch(() => route.params.id, () => {
  contentId.value = resolveRouteContentId();
});

// --- Methods ---

function navigateToEpisode() {
  router.push({
    name: 'episode',
    params: {
      content: contentId.value,
      episode: startWatchEpisodeId.value
    }
  });
}

function resolveRouteContentId(): string {
  const routeParam = route.params.id;
  if (Array.isArray(routeParam)) {
    return String(routeParam[0] ?? "");
  }

  return String(routeParam ?? "");
}

async function heartOnClick() {
  if (!details.value) return;

  if (isInFavorites.value) {
    await favoritesApi.setStatus(contentId.value, null);
    isInFavorites.value = false;
    userFavoriteStatus.value = DEFAULT_FAVORITE_STATUS;
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

  await favoritesApi.setStars(contentId.value, starIndex);
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

type TheaterMetaItem = {
  id: "episodes" | "views" | "duration" | "updated" | "created";
  label: string;
  value: string;
  icon: Component;
};

function getMetaItemsFromDetails(data: V1GetFullContentResponse | null): TheaterMetaItem[] {
  const items: TheaterMetaItem[] = [];
  if (!data) return items;
  const { Content } = data;

  items.push({
    id: "episodes",
    label: "Серий",
    value: `${Content.OutSeries}/${Content.PlannedSeries}`,
    icon: AddLibraryIcon
  });

  if (Content.Views > 0) {
    items.push({
      id: "views",
      label: "Просмотров",
      value: String(Content.Views),
      icon: EyeIcon
    });
  }

  const durationStr = formatDuration(Content.Duration);
  if (durationStr) {
    items.push({
      id: "duration",
      label: "Длительность",
      value: durationStr,
      icon: LoopIcon
    });
  }

  const updateDate = formatDate(Content.LastUpdateAt);
  if (updateDate) {
    items.push({
      id: "updated",
      label: "Обновлено",
      value: updateDate,
      icon: CalendarIcon
    });
  }

  const createDate = formatDate(Content.CreatedAt);
  if (createDate) {
    items.push({
      id: "created",
      label: "Создано",
      value: createDate,
      icon: CalendarIcon
    });
  }

  return items;
}

function formatDuration(durationInMinutes: number | null): string | null {
  if (durationInMinutes === null || durationInMinutes <= 0) {
    return null;
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  const parts = [
    hours > 0 ? `${hours} ч` : "",
    minutes > 0 ? `${minutes} мин` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
}

function formatDate(value: number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = normalizeTimestampToMs(value);
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // Корпоративный и однозначный формат даты: DD.MM.YYYY, HH:mm
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeTimestampToMs(value: number): number {
  // Поддерживаем как unix-seconds, так и unix-milliseconds.
  return value < 1_000_000_000_000 ? value * 1000 : value;
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

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
  }

  &__meta-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 4px;
    border-bottom: 1px solid #EEEFF4;

    &:first-child {
      padding-top: 4px;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 4px;
    }
  }

  &__meta-item--stacked {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  &__meta-main {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__meta-icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    color: var(--primary40);
    flex-shrink: 0;
  }

  &__meta-icon :deep(svg) {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
  }

  &__meta-label {
    color: #969BAB;
    margin: 0;
    white-space: nowrap;
  }

  &__meta-value {
    margin: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }

  &__meta-item--stacked &__meta-value {
    text-align: left;
    padding-left: 24px;
  }
}
</style>
<template>
  <div class="episode gap-16">
    <!-- Основной блок с плеером и информацией -->
    <BaseBackground
      v-if="dataIsReady"
      :type="2"
      class="episode__card"
    >
      <!-- Заголовок и мета-информация -->
      <div class="episode__header">
        <router-link
          v-if="content"
          :to="{ name: 'theater', params: { id: contentId }}"
          class="episode__back-link"
        >
          <p class="headline-medium episode__title">
            {{ content.Content.Title }}
          </p>
        </router-link>

        <div v-if="currentEpisode">
          <p class="title-medium episode__subtitle">
            {{ "Серия " + currentEpisode.Number }}{{ currentEpisode.Title ? (': ' + currentEpisode.Title) : "" }}
          </p>
        </div>

        <div class="episode__meta">
          <filter-chips
            v-if="content.Content.Type"
            class="m3-bg-2 episode__chip"
            :text="(mapContentTypeToRuStr(content.Content.Type)).toString()"
          />
          <filter-chips
            v-if="content.Content.Status"
            class="m3-bg-2 episode__chip"
            :text="(mapContentStatusToRuStr(content.Content.Status)).toString()"
          />
          <filter-chips
            v-if="content.Content.ReleasedAt"
            class="m3-bg-2 episode__chip"
            :text="moment(content.Content.ReleasedAt).format('YYYY')"
          />
          <filter-chips
            v-if="content.Content.Country"
            class="m3-bg-2 episode__chip"
            :text="content.Content.Country.toString()"
          />
          <filter-chips
            v-if="content.Content.MinAgeLimit > 0"
            class="m3-bg-2 episode__chip"
            :text="content.Content.MinAgeLimit.toString()+'+'"
          />
          <filter-chips
            v-if="content.Genres?.length > 0"
            class="m3-bg-2 episode__chip"
            :text="content.Genres[0]?.Name"
          />
        </div>
      </div>

      <!-- Плеер -->
      <div v-if="selectedTranslation" class="episode__player-wrapper">
        <iframe
          v-if="isSelectedVideoLinkValid"
          class="episode__iframe"
          :src="selectedTranslation.Link"
          frameborder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
        />
        <div v-else class="episode__player-placeholder m-border m-radius-16 v__center h__center m3-bg-5">
          <p class="title-large">
            Видео сейчас не доступно
          </p>
        </div>
      </div>
    </BaseBackground>

    <!-- Кнопки навигации -->
    <div v-show="previousEpisode || nextEpisode" class="episode__nav row gap-16">
      <router-link
        v-if="previousEpisode"
        class="episode__nav-btn m-radius-16 column gap-8"
        :to="{
          name: 'episode',
          params: {
            content: contentId,
            episode: previousEpisode.Id
          }}"
      >
        <div class="title-medium row gap-8">
          <nav-left-arrow-icon />
          Предыдущий эпизод
        </div>
        <div class="headline-small">
          Серия {{ previousEpisode.Number }}{{ (previousEpisode.Title ? ": " + previousEpisode.Title : "") }}
        </div>
      </router-link>

      <router-link
        v-if="nextEpisode"
        class="episode__nav-btn m-radius-16 column gap-8"
        :to="{
          name: 'episode',
          params: {
            content: contentId,
            episode: nextEpisode.Id
          }}"
      >
        <div class="title-medium row gap-8">
          Следующий эпизод
          <nav-right-arrow-icon />
        </div>
        <div class="headline-small">
          Серия {{ nextEpisode.Number }}{{ (nextEpisode.Title ? ": " + nextEpisode.Title : "") }}
        </div>
      </router-link>
    </div>

    <base-background v-if="selectedTranslation !== null" class="column gap-8 ">
      <div>
        Переводычи:
      </div>
      {{ translations.Translators }}
      <div>
        Инфа о текущем переводе
      </div>
      {{ selectedTranslation }}
    </base-background>

    <!-- Список эпизодов (компонент) -->
    <translations-list-component-v3
      v-if="dataIsReady"
      :content-id="contentId"
      :selected-translator-id="translationId"
    />
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import moment from "moment/moment";

// Components
import BaseBackground from "@/components/Base/BaseBackground.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import TranslationsListComponentV3 from "@/components/UseReadyComponents/EpisodesList/TranslationsListComponentV3.vue";
import NavLeftArrowIcon from "@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue";
import NavRightArrowIcon from "@/components/Icons/MaterialIcons/NavRightArrowIcon.vue";

// Models & Enums
import { mapContentTypeToRuStr } from "@/api/Enums/ContentType";
import { mapContentStatusToRuStr } from "@/api/Enums/ContentStatus";
import { ContentSelectedInfo } from "@/api/Enums/ContentSelectedInfo";
import { EpisodeOrderType } from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

// Services & Requests
import { ContentService } from "@/api/ContentService";
import { TranslationService } from "@/api/TranslationService";
import { EpisodeService } from "@/api/EpisodeService";
import { V1GetByEpisodeRequest } from "@/api/Requests/V1GetByEpisodeRequest";
import { V1GetByQueryRequest, V1GetByQuerySearchFilters } from "@/api/Requests/V1GetByQueryRequest";
import { V1GetFullContentEpisode } from "@/api/Responses/V1GetFullContentResponse";
import {
  V1GetByEpisodeResponse,
  V1GetByEpisodeResponseEpisode,
  V1GetByEpisodeResponseTranslation
} from "@/api/Responses/V1GetByEpisodeResponse";
import { V1GetByQueryResponseContent } from "@/api/Requests/V1GetByQueryResponse";

const route = useRoute();

// Services
const contentService = inject<ContentService>('content-service')!;
const translationService = inject<TranslationService>('translation-service')!;
const episodeService = inject<EpisodeService>('episode-service')!;

// State
const dataIsReady = ref<boolean>(false);
const content = ref<V1GetByQueryResponseContent | null>(null);
const translations = ref<V1GetByEpisodeResponse | null>(null);

const currentEpisode = ref<V1GetFullContentEpisode | null>(null);
const previousEpisode = ref<V1GetFullContentEpisode | null>(null);
const nextEpisode = ref<V1GetFullContentEpisode | null>(null);

const selectedTranslation = ref<V1GetByEpisodeResponseTranslation | null>(null);
const isSelectedVideoLinkValid = ref<boolean>(false);

// Computed params for cleaner access
const contentId = computed(() => Number(route.params.content));
const episodeId = computed(() => Number(route.params.episode));
const translationId = computed(() => Number(route.params.translation) > 0 ? Number(route.params.translation) : 0);

onMounted(async () => {
  await setContents();
});

watch(() => route.params.episode, async (newVal) => {
  if (newVal) await setContents();
});

async function setContents() {
  dataIsReady.value = false;
  isSelectedVideoLinkValid.value = false;
  previousEpisode.value = null;
  nextEpisode.value = null;

  try {
    // 1. Get Content Info
    const request = new V1GetByQueryRequest();
    const filters = new V1GetByQuerySearchFilters();
    request.SelectedInfo = ContentSelectedInfo.Episodes;
    filters.ContentIds = [contentId.value];
    request.Filters = filters;

    const contentsResponse = await contentService.V1GetByQuery(request);
    if (contentsResponse.Content.length !== 1) {
      throw new Error("Content not found exception");
    }
    content.value = contentsResponse.Content.find(x => x.Content.Id == contentId.value)!;
    // 2. Determine Current, Prev, Next
    currentEpisode.value = content.value.Episodes.find(value => value.Id == episodeId.value) || null;

    // 3. Get Translations/Episodes for Player logic
    const translationsRequest = new V1GetByEpisodeRequest(contentId.value, currentEpisode.value.Id, null, EpisodeOrderType.ByNumber);
    translations.value = await translationService.V1GetByEpisodeAsync(translationsRequest);


    if (currentEpisode.value) {
      // Ищем эпизод в списке переводов, чтобы достать ссылку на видео
      if (translations.value?.Episodes) {
        selectedTranslation.value = getCurrentEpisodeTranslation(translationId.value, translations.value.Episodes);

        // Сортируем и ищем соседей
        const orderedEpisodes = [...translations.value.Episodes].sort((a, b) => a.Number - b.Number);
        const currentIndex = orderedEpisodes.findIndex(ep => ep.Number === currentEpisode.value!.Number);

        if (currentIndex !== -1) {
          if (currentIndex > 0) previousEpisode.value = orderedEpisodes[currentIndex - 1];
          if (currentIndex < orderedEpisodes.length - 1) nextEpisode.value = orderedEpisodes[currentIndex + 1];
        }
      }
    }

    // 4. Post-actions
    await validateVideoLink();
    await episodeService.incrementViews(episodeId.value);

  } catch (e) {
    console.error("Error loading episode:", e);
  } finally {
    dataIsReady.value = true;
  }
}

function getCurrentEpisodeTranslation(
  pathTranslationId: number,
  episodesWithTranslations: V1GetByEpisodeResponseEpisode[]
) : V1GetByEpisodeResponseTranslation | null {

  if (!episodesWithTranslations || episodesWithTranslations.length === 0) return null;

  const episode = episodesWithTranslations.find(ep => ep.Id == episodeId.value);
  if (!episode || !episode.Translations || episode.Translations.length === 0) return null;

  if (pathTranslationId > 0) {
    const selected = episode.Translations.find(t => t.Id === pathTranslationId);
    if (selected) return selected;
  }

  // default
  return episode.Translations[0];
}

async function validateVideoLink() {
  if (!selectedTranslation.value?.Link) {
    isSelectedVideoLinkValid.value = false;
    return;
  }

  try {
    const resp = await fetch(selectedTranslation.value.Link, { mode: 'no-cors'});
    // no-cors возвращает opaque response. status всегда 0, ok всегда false.
    // Если запрос не упал с network error, считаем что ссылка живая.
    isSelectedVideoLinkValid.value = (resp.type === "opaque" || resp.ok);
  } catch (exception) {
    console.error("Video link validation failed:", exception);
    isSelectedVideoLinkValid.value = false;
  }
}
</script>

<style lang="scss" scoped>
.episode {
  display: grid;
  grid-template-rows: max-content;
  padding: 20px 0;

  &__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 20px;
  }

  &__back-link {
    text-decoration: none;
  }

  &__title {
    text-align: left;
    padding: 0;
    margin: 0;
    color: var(--primary40);
  }

  &__subtitle {
    text-align: left;
    padding: 0;
    margin: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;

    /* Dynamic styles from original code moved to scss if possible,
       but chips use inline styles in template for specific colors */
  }

  &__chip {
    color: var(--primary40) !important;
  }

  &__player-wrapper {
    display: flex;
    width: 100%;
    background: #000; /* Fallback background */
  }

  &__iframe {
    width: 100%;
    height: 607.5px;
    border: none;

    @media (max-width: 768px) {
      height: 300px;
    }
  }

  &__player-placeholder {
    display: flex;
    padding: 20px;
    margin: 16px;
    width: 100%;
    min-height: 200px;
  }

  &__nav {
    /* row and gap-16 are utility classes */
  }

  &__nav-btn {
    background: white;
    padding: 24px;
    width: 100%;
    text-align: start;
    justify-content: center;
    transition: background-color .3s cubic-bezier(.2,0,0,1);
    text-decoration: none;
    color: inherit;

    &:hover {
      color: var(--on-secondary-container-light);
      background: var(--secondary-container-light);
    }
  }
}
</style>
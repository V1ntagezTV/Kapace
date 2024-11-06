<template>
  <div class="material episode__body-box">
    <BaseBackground
      v-if="dataIsReady"
      :type="2"
      class="episode__main"
    >
      <div class="episode__title-main">
        <router-link v-if="content" :to="{ name: 'theater', params: { id: contentId }}">
          <p class="headline-medium episode__title" style="color: var(--primary40)">
            {{ content.Content.Title }}
          </p>
        </router-link>

        <div v-if="selectedEpisode">
          <p class="title-medium episode__title">
            {{ "Серия " + selectedEpisode.Number }}{{ selectedEpisode.Title ? (': ' + selectedEpisode.Title) : "" }}
          </p>
        </div>

        <div class="episode__title-secondary">
          <filter-chips
            v-show="content.Content.Type"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="(mapContentTypeToRuStr(content.Content.Type)).toString()"
          />
          <filter-chips
            v-show="content.Content.Status"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="(mapContentStatusToRuStr(content.Content.Status)).toString()"
          />
          <filter-chips
            v-show="content.Content.ReleasedAt"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="moment(new Date(content.Content.ReleasedAt)).format('YYYY')"
          />
          <filter-chips
            v-show="content.Content.Country !== undefined"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="content.Content.Country.toString()"
          />
          <filter-chips
            v-show="content.Content.MinAgeLimit > 0"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="content.Content.MinAgeLimit.toString()+'+'"
          />
          <filter-chips
            v-show="content.Genres?.length > 0"
            class="m3-bg-2"
            style="color: var(--primary40)"
            :text="content.Genres[0]?.Name"
          />
        </div>
      </div>
      <div v-if="selectedTranslation" class="episode__video-main">
        <iframe
          v-if="isSelectedVideoLinkValid"
          class="episode__player"
          :src="selectedTranslation.Link"
          frameborder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
        />
        <div v-else class="episode__video-unavailable m-border m-radius-16 v__center h__center m3-bg-5">
          <p class="title-large">
            Видео сейчас не доступно
          </p>
        </div>
      </div>
    </BaseBackground>

    <translations-list-component-v2
      v-if="dataIsReady"
      :content-id="contentId"
      :episodes="episodes"
      :episodes-total-count="0"
      :translators="mapToTranslators(translations?.Translators ?? [])"
      :selected-translator-id="translationId"
      @sort-by:update="(value) => {
        episodesListParams.sortBy.value = value;
        updateEpisodesList();
      }"
      @translator:update="(value) => {
        episodesListParams.translator.value = value;
        updateEpisodesList();
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref, watch} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetFullContentEpisode} from "@/api/Responses/V1GetFullContentResponse";
import {TranslationService} from "@/api/TranslationService"
import {useRoute} from "vue-router";
import moment from "moment/moment";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {
  V1GetByEpisodeResponse,
  V1GetByEpisodeResponseEpisode, V1GetByEpisodeResponseTranslation
} from "@/api/Responses/V1GetByEpisodeResponse";
import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import {V1GetByQueryRequest, V1GetByQuerySearchFilters} from "@/api/Requests/V1GetByQueryRequest";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {EpisodeService} from "@/api/EpisodeService";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import {mapContentTypeToRuStr} from "@/api/Enums/ContentType";
import {mapContentStatusToRuStr} from "@/api/Enums/ContentStatus";
import TranslationsListComponentV2 from "@/components/UseReadyComponents/EpisodesList/TranslationsListComponentV2.vue";
import {
  ALL_FILTER,
  mapToEpisodeOrderType,
  mapToEpisodes,
  mapToTranslators, Order, Translation
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";


const route = useRoute();
let episodeId = route.params.episode as number;
let contentId = route.params.content as number;

console.log("EPISODE: " + episodeId + "\nCONTENT: " + contentId);

let translationId = +route.params.translation > 0 ? (+route.params.translation) : 1;

const contentService: ContentService = inject('content-service');
const translationService: TranslationService = inject('translation-service');
const episodeService: EpisodeService = inject('episode-service');

const dataIsReady = ref<boolean>(false);
const content = ref<V1GetByQueryResponseContent>(null);
const translations = ref<V1GetByEpisodeResponse>(null);
const selectedEpisode = ref<V1GetFullContentEpisode>(null);
const selectedTranslation = ref<V1GetByEpisodeResponseTranslation>(null);
const isSelectedVideoLinkValid = ref<boolean>(false);

let episodes: Translation[] = [];
const episodesListParams = {
  translator: ref<string>(),
  sortBy: ref<string>(Order.ByNumber)
};

onMounted(async() => {
  await SetContents()
  await updateEpisodesList();
});

async function updateEpisodesList() {
  let translatorId = null
  if (episodesListParams.translator.value) {
    if (episodesListParams.translator.value === ALL_FILTER) {
      translatorId = null;
    } else {
      const translator = translations.value.Translators.find(x => x.Name === episodesListParams.translator.value);
      translatorId = translator.Id;
    }
  }

  console.log(episodesListParams.sortBy.value as Order);

  const request = new V1GetByEpisodeRequest(
    contentId,
    null,
    translatorId,
    mapToEpisodeOrderType(episodesListParams.sortBy.value as Order)
  );

  translations.value = await translationService.V1GetByEpisodeAsync(request);
  episodes = mapToEpisodes(translations.value.Episodes);
}

async function SetContents() {
  const request = new V1GetByQueryRequest();
  const filters = new V1GetByQuerySearchFilters();
  request.SelectedInfo = ContentSelectedInfo.Episodes;
  filters.ContentIds = new Array<number>(contentId);
  request.Filters = filters;

  contentId = route.params.content as number;
  episodeId = route.params.episode as number;
  translationId = +route.params.translation > 0 ? (+route.params.translation) : 0;
  dataIsReady.value = false;

  const contentsResponse = await contentService.V1GetByQuery(request)
  if (contentsResponse.Content.length !== 1) {
    const error = new Error();
    error.message = "Content not found exception";
    throw error;
  }
  await episodeService.incrementViews(episodeId);

  content.value = contentsResponse.Content.find(x => x.Content.Id == contentId);
  translations.value = await translationService.V1GetByEpisodeAsync(new V1GetByEpisodeRequest(contentId));
  selectedEpisode.value = content.value.Episodes.find(x => x.Id == episodeId);
  selectedTranslation.value = getCurrentEpisodeTranslation(translationId, translations.value.Episodes);
  await validateVideoLink();
  dataIsReady.value = true;
}

async function validateVideoLink() {
  if (selectedTranslation.value.Link) {
    try {
      console.log(selectedTranslation.value.Link);
      await fetch(selectedTranslation.value.Link, { mode: 'no-cors'})
        .then((resp) => {
          let status = true;
          if (!resp.ok || resp.status != 200) status = false;
          if (resp.type == "opaque") status = true;

          isSelectedVideoLinkValid.value = status;
        });

      console.log("Site status: " + isSelectedVideoLinkValid.value);
    }
    catch (exception) {
      console.log(exception);
      isSelectedVideoLinkValid.value = false;
    }
  }
}

function getCurrentEpisodeTranslation(
  pathTranslationId: number,
  episodesWithTranslations: V1GetByEpisodeResponseEpisode[]) : V1GetByEpisodeResponseTranslation {

  if (episodesWithTranslations.length === 0) {
    throw new Error("Translations not found! (1)")
  }

  const episode = episodesWithTranslations.find(episode => episode.Id == episodeId);
  if (episode.Translations.length === 0) {
    throw new Error("Translations not found! (2)")
  }

  if (pathTranslationId > 0) {
    const selectedTranslator = episode.Translations.find(translation => translation.Id === pathTranslationId);
    if (selectedTranslator != undefined) {
      return selectedTranslator;
    }
  }

  // as default;
  return episode.Translations[0];
}

watch(() => route.params.episode, async () => {
  if (!route.params.episode) {
    return;
  }

  await SetContents();
})

</script>

<style lang="scss" scoped>
.episode {
  &__video-unavailable {
    display: flex;
    padding: 20px;
    margin: 16px;
    width: 100%;
  }

  &__body-box {
    display: grid;
    grid-template-rows: max-content;
    gap: 20px;
    padding-bottom: 20px;
    padding-top: 20px;
  }

  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: fit-content;
    overflow: hidden;
  }

  &__title-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 20px;
  }

  &__player-box {
    border-top: 1px solid var(--font-gray-v2);
  }

  &__player {
    width: 100%;
    height: 607.5px;
  }

  &__title {
    text-align: left;

    padding: 0;
    margin: 0;
  }

  &__icon-style {
    color: var(--primary);

    &:hover {
      cursor: pointer;
      color: var(--secondary);
    }
  }

  &__title-secondary {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    color: var(--font-gray-v4);
    font-weight: 700;
    font-size: 14px;

    & p {
      margin: 0;
    }
  }

  &__title-rating {
    background: var(--secondary);
    color: #FFF;
    padding: 4px;
    border-radius: 4px;
  }

  &__video {
    width: 100%;
    height: 600px;
  }

  &__video-main {
    display: flex;
    width: 100%;
    flex-direction: row;
  }

  &__video-translations {
		display: flex;
		flex-direction: column;
    width: 100%;
    max-height: inherit;
  }

  &__video-tabs {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    border-bottom: 1px solid var(--font-gray-v1);
  }

  &__video-translate {
    font-weight: 500;
    color: var(--font-gray);
    text-align: start;
    border-radius: 0;
    padding-left: 20px;
    padding-right: 20px;
    transition: none;

    &:hover {
      background: var(--white);
      text-decoration: underline;
      color: var(--primary);
      text-underline: var(--primary);
      border: none;
    }
  }
  
  &__episodes {
    display: grid;
  }
}

</style>
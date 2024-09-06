<template>
  <div class="episode__body-box">
    <BaseBackground v-if="dataIsReady" class="episode__main">
      <div class="episode__title-main">
        <div class="episode__title-primary">
          <router-link v-if="details" :to="{ name: 'theater', params: { id: contentId }}">
            <h1 class="episode__title">
              {{ title }}
            </h1>
          </router-link>
        </div>

        <div v-if="selectedEpisode" class="episode__title-primary">
          <h2 class="episode__title">
            {{ "Эпизод " + selectedEpisode.Number }}
          </h2>
        </div>

        <div class="episode__title-secondary">
          <p v-if="details.ImportStars >= 1" class="episode__title-rating">
            {{ details.ImportStars }}
          </p>
          <p>{{ details.Country }}</p>
          <p>{{ moment(new Date(details.ReleasedAt)).format('YYYY') }}</p>
          <p v-if="details.Genres?.length > 0">
            {{ details.Genres[0]?.Name ?? "123" }}
          </p>
          <p v-if="details.MinAgeLimit > 0">
            {{ details.MinAgeLimit + '+' }}
          </p>
        </div>
      </div>
      <div v-if="selectedTranslation" class="episode__video-main episode__player-box">
        <div class="episode__player">
          <iframe
            class="episode__player"
            :src="selectedTranslation.Link"
            frameborder="0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
          />
        </div>
        <div class="episode__video-translations">
          <div v-for="episode in details.Episodes" :key="episode">
            <router-link
              :to="{ name: 'episode', params: {
                content: contentId,
                episode: episode.Id,
                translation: selectedTranslation.Id
              }}"
            >
              <base-button class="episode__video-translate" :button-type="3">
                {{ episode.Number }} Серия: {{ episode.Title }}
              </base-button>
            </router-link>
          </div>
        </div>
      </div>
    </BaseBackground>

    <TranslationsListComponent
      v-if="dataIsReady"
      :content-id="contentId"
      :episode-id="episodeId ?? null"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, onMounted, ref, watch} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetFullContentEpisode} from "@/api/Responses/V1GetFullContentResponse";
import {TranslationService} from "@/api/TranslationService"
import {useRoute} from "vue-router";
import moment from "moment/moment";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {
  V1GetByEpisodeResponse,
  V1GetByEpisodeResponseEpisode, V1GetByEpisodeResponseTranslation,
  V1GetByEpisodeResponseTranslator
} from "@/api/Responses/V1GetByEpisodeResponse";
import BaseButton from "@/components/Base/BaseButton.vue";
import {EpisodeListViewModel} from "@/components/Body/ViewModels/EpisodeListViewModel";
import {TranslationType} from "@/api/Enums/TranslationType";
import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import {V1GetByQueryRequest, V1GetByQuerySearchFilters} from "@/api/Requests/V1GetByQueryRequest";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import TranslationsListComponent from "@/components/UseReadyComponents/TranslationsListComponent.vue";

const route = useRoute();
let episodeId = route.params.episode as number;
let contentId = route.params.content as number;

console.log("EPISODE: " + episodeId + "\nCONTENT: " + contentId);

let translationId = +route.params.translation > 0 ? (+route.params.translation) : 1;

const contentService: ContentService = inject('content-service');
const translationService: TranslationService = inject('translation-service');

const dataIsReady = ref<boolean>(false);
const details = ref<V1GetByQueryResponseContent>(null);
const translations = ref<V1GetByEpisodeResponse>(null);
const selectedEpisode = ref<V1GetFullContentEpisode>(null);
const selectedTranslation = ref<V1GetByEpisodeResponseTranslation>(null);
const episodeListViewModel = ref<EpisodeListViewModel>(null);

onMounted(async() => { await SetContents() });

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

  details.value = contentsResponse.Content.find(x => x.Id == contentId);
  translations.value = await translationService.V1GetByEpisodeAsync(new V1GetByEpisodeRequest(contentId, episodeId));
  selectedEpisode.value = details.value.Episodes.find(x => x.Id == episodeId);

  console.log(translations.value);
  selectedTranslation.value = getCurrentEpisodeTranslation(translationId, translations.value.Episodes);
  episodeListViewModel.value = mapToEpisodeListViewModel(selectedEpisode.value, selectedTranslation.value, translations.value.Translators);
  dataIsReady.value = true;
}

function getCurrentEpisodeTranslation(
  pathTranslationId: number,
  episodesWithTranslations: V1GetByEpisodeResponseEpisode[]
)
  : V1GetByEpisodeResponseTranslation {
  if (episodesWithTranslations.length === 0) {
    throw new Error("Translations not found!")
  }

  const episode = episodesWithTranslations.find(episode => episode.Id == episodeId);

  if (pathTranslationId > 0) {
    const selectedTranslator = episode.Translations.find(translation => translation.Id === pathTranslationId);
    if (selectedTranslator != undefined) {
      return selectedTranslator;
    }
  }

  // as default;
  return episode.Translations[0];
}

function mapToEpisodeListViewModel(
  episode: V1GetFullContentEpisode,
  selectedTranslator: V1GetByEpisodeResponseTranslation,
  translators: V1GetByEpisodeResponseTranslator[])
  : EpisodeListViewModel {
  console.log(selectedTranslator)

  return <EpisodeListViewModel>({
    contentId: contentId,
    currentTranslatorId: selectedTranslator.Id,
    currentEpisodeId: episode.Id,
    currentPage: 1,
    episodes: details.value.Episodes.map(x => ({
      episodeId: x.Id,
      number: x.Number,
      title: x.Title,
      releasedDate: 0,
      views: 0, //x.Views,
      stars: 4,//x.Stars,
      translationId: selectedTranslator.Id,
      translationLink: selectedTranslator.Link,
    })).sort(x => x.number),
    translators: translators.map(x => ({
      title: x.Name,
      player: "vk.com",
      type: TranslationType.Subtitles
    })),
    translatorName: "Jopa",
    offset: 1,
    limit: 2,
  });
}

const title = computed(() => {
	return !selectedEpisode.value?.Title
		? details.value.Title
		: details.value.Title + ": " + selectedEpisode.value.Title;
});

watch(() => route.params.episode, async () => {
  if (!route.params.episode) {
    return;
  }

  await SetContents();
})

</script>

<style lang="scss" scoped>
.episode {
  &__body-box {
    display: grid;
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
    gap: 10px;
    width: 100%;
    padding: 20px;
  }

  &__player-box {
    border-top: 1px solid var(--font-gray-v2);
  }

  &__player {
    width: 1080px;
    height: 607.5px;
  }

  &__title-primary {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }

  &__title {
    font-style: normal;
    font-weight: 700;
    text-align: left;

    padding: 0;
    margin: 0;
    transition: color 0.25s;

    &:hover {
      color: var(--primary)
    }
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
<template>
  <div>
    <BaseBackground v-if="dataIsReady" class="episode__main">
      <div class="episode__title-main">
        <div class="episode__title-primary">
          <router-link :to="{ name: 'theater', params: { id: details.ContentId }}">
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
            {{ '+' + details.MinAgeLimit }}
          </p>
        </div>
      </div>
      <div v-if="selectedTranslation" class="episode__video-main">
        <div>
          <iframe
            :src="selectedTranslation.Link"
            width="640" height="360"
            frameborder="0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
          />
        </div>
        <BaseBackground :type="3" class="episode__video-translations">
          <div class="episode__video-tabs">
            <BaseButton :button-type="3">
              Субтитры
            </BaseButton>
            <BaseButton :button-type="3">
              Озвучка
            </BaseButton>
          </div>

          <div v-for="translation in translations.Translations" :key="translation">
            <router-link :to="{ name: 'episode', params: { episode: translation.EpisodeId, translation: translation.TranslationId } }">
              <base-button class="episode__video-translate" :button-type="3">
                {{ translation.Translator }} / {{ translation.Quality }}p  / {{ translation.Language }}
              </base-button>
            </router-link>
          </div>
        </BaseBackground>
      </div>
    </BaseBackground>

    <TheaterVideos v-if="details" :videos="details.Episodes" />
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, onMounted, ref, watch} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetFullContentEpisode, V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {TranslationService} from "@/api/TranslationService"
import {useRoute} from "vue-router";
import moment from "moment/moment";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import {V1GetByEpisodeResponse, V1GetByEpisodeTranslation} from "@/api/Responses/V1GetByEpisodeResponse";
import BaseButton from "@/components/Base/BaseButton.vue";
import TheaterVideos from "@/components/Theater/TheaterVideos.vue";

const route = useRoute();
let episodeId = route.params.episode as number;
let translationId = +route.params.translation > 0 ? (+route.params.translation) : 1;

console.log("episode: " + episodeId);
console.log("translation: " + translationId);

const contentService: ContentService = inject('content-service');
const translationService: TranslationService = inject('translation-service');

const dataIsReady = ref<boolean>(false);
const details = ref<V1GetFullContentResponse>(null);
const translations = ref<V1GetByEpisodeResponse>(null);
const selectedEpisode = ref<V1GetFullContentEpisode>(null);
const selectedTranslation = ref<V1GetByEpisodeTranslation>(null);

onMounted(async() => { await SetContents() });

async function SetContents() {
  episodeId = route.params.episode as number;
  translationId = +route.params.translation > 0 ? (+route.params.translation) : 1;

  dataIsReady.value = false;
  details.value = await contentService.V1GetFullContentAsync(episodeId, 0);
  translations.value = await translationService.V1GetByEpisodeAsync(new V1GetByEpisodeRequest(episodeId));

  selectedEpisode.value = details.value.Episodes.find(x => x.Id === episodeId);
  selectedTranslation.value = translations.value.Translations.find(x => x.TranslationId === translationId);

  console.log(translationId);
  console.log(selectedTranslation.value);
  dataIsReady.value = true;
}

const title = computed(() => {
	return !selectedEpisode.value?.Title
		? details.value.Title
		: details.value.Title + ": " + selectedEpisode.value.Title;
});

watch(() => route.params, async () => {
  await SetContents();
})

</script>

<style lang="scss" scoped>
.episode {
  &__main {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: fit-content;
    padding: 20px;
    margin: 20px 0 20px 0;
  }

  &__title-main {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
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
    gap: 20px;
  }

  &__video-translations {
		display: flex;
		flex-direction: column;
    width: 100%;
		border-radius: 6px;
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
    padding-left: 10px;
    padding-right: 10px;
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
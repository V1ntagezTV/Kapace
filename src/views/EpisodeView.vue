<template>
  <BaseBackground class="episode__main">
    <div v-if="details" class="episode__title-main">
      <div class="episode__title-primary">
        <router-link :to="{ name: 'theater', params: { id: details.ContentId}}">
          <h1 class="episode__title">
            {{ details.Title }}
          </h1>
        </router-link>

        <HeartSVG
          :is-selected="isInFavorite"
          class="episode__icon-style"
          @click="heartOnClick()"
        />
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

    <div class="episode__video-main">
      <iframe
        class="episode__video"
        src="https://www.youtube.com/embed/EjYFSq90Iic"
        title="НИКС О РОСТИКЕ И ТУРНИРЕ СТРИМЕРОВ"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <div class="episode__video-translations">
        <div v-for="translation in translations" :key="translation">
          Перевод
        </div>
      </div>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {TranslationService, V1GetByEpisodeRequest, V1GetByEpisodeResponse} from "@/api/TranslationService"
import {useRoute} from "vue-router";
import moment from "moment/moment";
import HeartSVG from "@/components/Icons/HeartSVG.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";

const route = useRoute();
const episodeId = ref(route.params.episode as number);
const translationId = ref((+route.params.translation) >= 0
  ? (+route.params.translation)
  : 0);

console.log("episode: " + episodeId.value);
console.log("translation: " + translationId.value);

const contentService: ContentService = inject('content-service');
const translationService: TranslationService = inject('translation-service');

const details = ref<V1GetFullContentResponse>(null);
const translations = ref<V1GetByEpisodeResponse>(null);
let isInFavorite = ref<boolean>(true);

onMounted(async() => {
  details.value = await contentService.V1GetFullContentAsync(episodeId.value, 0);
  translations.value = await translationService.V1GetByEpisodeAsync(new V1GetByEpisodeRequest(episodeId.value));
})

function heartOnClick() {
  /*
props.details.contentInfoToUser.isInFavourite = !props.details.contentInfoToUser.isInFavourite;
isInFavorite.value = !isInFavorite.value;
	 */
}
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
    font-size: 34px;
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
    width: 150px;
    height: 150px;
    background: #112D3D;
  }
}

</style>
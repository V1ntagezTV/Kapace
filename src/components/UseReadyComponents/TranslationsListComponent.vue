<template>
  <div
    v-show="episodeTranslations.length > 0"
    class="material m-radius-2 m3-bg-1 main__box"
    :class="{
      'material m3-bg-1 main__box-with-paging': episodeTranslations.length < currentOffset
    }"
  >
    <div class="main__header-box main__margins">
      <div class="main__title-box">
        <h3 class="main__title">
          Эпизоды
        </h3>
        <h4 class="main__title">
          {{ currentOffset }} - {{ currentOffset + episodeTranslations.length }} / {{ totalCount }}
        </h4>
      </div>
      <div class="main__filters">
        <base-selector
          v-model="translatorFilter"
          class="main__filter-button m-radius-1 m3-bg-3"
          :title="'Переводчик'"
          :selectable-values="translators.map(x => x.Name)"
        />
        <base-selector
          v-model="orderByFilter"
          class="main__filter-button m-radius-1 m3-bg-3"
          :title="'Сортировка'"
          :selectable-values="[Order.ByNumber, Order.ByAge, Order.ByStars, Order.ByWatches]"
        />
      </div>
    </div>
    <div class="main__episodes-box">
      <template
        v-for="episodeTranslation in episodeTranslations"
        :key="episodeTranslation"
      >
        <router-link :to="{ name: 'episode', params: { content: contentId, episode: episodeTranslation.EpisodeId }}">
          <div class="box__inline main__episode-box">
            <div class="box__inline main__episode-attribute">
              {{ episodeTranslation.Number }} cерия{{ episodeTranslation.Title ? ": "+episodeTranslation.Title : "" }}
            </div>
            <div class="box__inline main__episode-attribute">
              <filter-chips
                v-show="!episodeTranslation.HasTranslations"
                class="m-border"
                :text="'Нет перевода'"
              />
              <div v-if="episodeTranslation.Stars > 0" class="box__inline main__episode-tag">
                <Star />
                {{ episodeTranslation.Stars }}
              </div>
              <div v-if="episodeTranslation.Views > 0" class="box__inline main__episode-tag">
                <Eye />
                {{ episodeTranslation.Views }}
              </div>
            </div>
          </div>
        </router-link>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {inject, onMounted, ref} from 'vue';
import {TranslationService} from "@/api/TranslationService";
import {V1GetByEpisodeRequest} from "@/api/Requests/V1GetByEpisodeRequest";
import Star from "@/components/Icons/MaterialIcons/Star.vue";
import Eye from "@/components/Icons/MaterialIcons/Eye.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import {
  mapToEpisodes,
  mapToTranslators, Order, Translation,
  Translator
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

const translationsService = inject<TranslationService>("translation-service");
if (translationsService === undefined) {
  const error = new Error();
    error.message = "TranslationService not found not imported";
    throw error;
}

const props = defineProps({
  contentId: {type: Number, required: true},
  episodeId: {type: Number, required: false, default: null},
  translatorId: {type: Number, required: false, default: null},
  limit: {type: Number, required: false, default: 10},
  offset: { type: Number, required: false, default: 0},
});

const episodeTranslations = ref<Translation[]>([]);
const translators = ref<Translator[]>([]);
const totalCount = ref<Number>(20);
const currentOffset = ref(0);

const translatorFilter = ref<string>();
const orderByFilter = ref<typeof Order>();

onMounted(async () => {
  const dataRequest = new V1GetByEpisodeRequest(props.contentId, props.episodeId, props.translatorId, null);
  const viewDataResponse = await translationsService.V1GetByEpisodeAsync(dataRequest);

  if (viewDataResponse.Episodes) {
    translators.value = mapToTranslators(viewDataResponse.Translators);
    episodeTranslations.value = mapToEpisodes(viewDataResponse.Episodes);
  }

  totalCount.value = viewDataResponse.Episodes.length;
});
</script>

<style lang="scss" scoped>
.main {
  &__episodes-box {
    border-top: 1px solid #EEEFF4;
    padding: 16px 0;
  }

  &__episode-attribute {
    display: grid;
    width: 100%;
    height: fit-content;
    align-content: center;
    justify-content: start;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    gap: 16px;

    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.02em;
    color: #525A92;
  }

  &__episode-tag {
    display: grid;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: rgba(82, 90, 146, 0.08);

    border-radius: 100px;
    padding: 6px 12px;
  }

  &__box {
    display: grid;
    height: fit-content;
    grid-template-rows: 64px 1fr;
    align-items: center;

    &-with-paging {
      grid-template-rows: 64px 1fr 64px;
    }
  }

  &__filter-button {
    height: auto;
    width: fit-content;

    &:hover {
      background: var(--surface-container-highest90);
    }
  }

  &__episode-box {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;

    height: 48px;
    width: 100%;
    gap: 24px;

    padding: 0 26px;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
      cursor: pointer;
    }
  }

  &__header-box {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: center;
  }

  &__title-box {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: center;
    align-items: center;
    gap: 24px;
  }

  &__title {
    color: var(--Gray-Gray-2, #474A57);
    text-align: justify;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px; /* 150% */
    letter-spacing: 0.15px;
    padding: 0;
    margin: 0;
  }

  &__margins {
    margin: 0 26px;
  }

  &__filters {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: auto;
    grid-auto-flow: column;
    height: 32px;
    gap: 16px;
  }
}
</style>
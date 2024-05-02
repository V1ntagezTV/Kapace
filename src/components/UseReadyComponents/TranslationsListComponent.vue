<template>
  <div
    class="material m3-radius-2 m3-bg-1 main__box"
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
        <select-menu
          class="main__filter-button m3-radius-1 m3-bg-2"
          :text="'Переводчик'"
          :list="translators.map(x => x.Name)"
        />
        <select-menu
          class="m3-radius-1 m3-bg-3"
          :text="'Сортировка'"
          :list="['По возрастанию', 'По убыванию', 'По просмотрам', 'По оценке']"
        />
      </div>
    </div>
    <div>
      <template v-for="episodeTranslation in episodeTranslations" :key="episodeTranslation">
        <router-link
          :to="{ name: 'episode', params: { content: contentId, episode: episodeTranslation.EpisodeId }}"
          class="theater-videos__video-image"
        >
          <div class="box__inline main__episode-box">
            <div class="box__inline main__episode-attribute">
              {{ episodeTranslation.Number }} cерия: {{ episodeTranslation.Title }}
            </div>
            <div class="box__inline main__episode-attribute">
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
import SelectMenu from "@/components/UseReadyComponents/MaterialComponents/SelectMenu.vue";
import Star from "@/components/Icons/MaterialIcons/Star.vue";
import Eye from "@/components/Icons/MaterialIcons/Eye.vue";

const translationsService: TranslationService = inject("translation-service");

export type Translation = {
  EpisodeId: number,
  Number: number,
  Title: string,
  Views: number,
  Stars: number,
}

export type Translator = {
  TranslatorId: number,
  Name: string,
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

const unknownTranslatorName = "Unknown";

onMounted(async () => {
  const dataRequest = new V1GetByEpisodeRequest(props.contentId, props.episodeId, props.translatorId);
  const viewDataResponse = await translationsService.V1GetByEpisodeAsync(dataRequest);

  if (viewDataResponse.Episodes) {
    translators.value = viewDataResponse.Translators.map(x => ({
      TranslatorId: x.Id,
      Name: x.Name === null ? unknownTranslatorName : x.Name
    }))

    episodeTranslations.value = viewDataResponse.Episodes.map(x =>({
      EpisodeId: x.Id,
      Number: x.Number,
      Title: x.Title,
      Views: x.Views,
      Stars: x.Stars,
    }));
  }

  totalCount.value = viewDataResponse.Episodes.length;
});
</script>

<style lang="scss" scoped>
.main {
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
    grid-template-rows: 64px 1fr;
    align-items: center;
    overflow: hidden;
    padding: 0 0 16px 0;

    &-with-paging {
      grid-template-rows: 64px 1fr 64px;
    }
  }

  &__filter-button {
    height: fit-content;
    width: fit-content;
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
    justify-content: space-between;
    grid-template-columns: auto auto;
  }

  &__title-box {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
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
    grid-template-columns: min-content auto;
    height: 32px;
    gap: 16px;
  }
}

</style>
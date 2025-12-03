<template>
  <div
    v-if="!isLoading || episodes.length > 0"
    class="episodes-list m-radius-2 m-border-primary"
    :class="{ 'episodes-list--with-paging': isPagingActive }"
  >
    <!-- Header -->
    <div class="episodes-list__header col-gap8 row-gap4 dynamic">
      <div class="episodes-list__title-group">
        <h3 class="title-large">
          Эпизоды
        </h3>
        <h4 class="title-large">
          {{ offset }} - {{ offset + episodes.length }} / {{ episodesTotalCount || episodes.length }}
        </h4>
      </div>

      <div class="row col-gap16 row-gap8 dynamic">
        <!-- Translator Filter -->
        <base-selector
          :model-value="translatorFilter"
          class="episodes-list__filter m-radius-1 m-border-primary"
          title="Переводчик"
          :selectable-values="availableTranslators"
          @update:modelValue="handleTranslatorUpdate"
        >
          <filter-chips-v2>
            <template #text>
              <p class="body-medium h__padding-8">
                {{ translatorFilter || 'Все' }}
              </p>
            </template>
          </filter-chips-v2>
        </base-selector>

        <!-- Sort Filter -->
        <base-selector
          :model-value="sortBy"
          class="row fit-content"
          :is-dropped="isOrderByMenuDropped"
          :selectable-values="sortOptions"
          @update:modelValue="handleSortUpdate"
        >
          <template #header>
            <filter-chips-v2
              class="episodes-list__filter m-radius-1 m-border-primary"
              :class="{'episodes-list__filter--active': isSortActive}"
              :enable-menu-icon="true"
              @click="toggleSortMenu"
            >
              <template #text>
                <p class="body-medium h__padding-8">
                  {{ sortBy }}
                </p>
              </template>
              <template #menu-icon>
                <material-drop-arrow />
              </template>
            </filter-chips-v2>
          </template>
        </base-selector>
      </div>
    </div>

    <div class="splitter" />

    <!-- Episodes Body -->
    <div class="episodes-list__body">
      <router-link
        v-for="episode in episodes"
        :key="episode.EpisodeId"
        class="episodes-list__link"
        :to="{
          name: 'episode',
          params: {
            content: contentId,
            episode: episode.EpisodeId,
            translation: selectedTranslatorId
          }
        }"
      >
        <!-- Episode Card Block -->
        <div class="episode-card box__inline">
          <div class="episode-card__title body-large box__inline">
            {{ episode.Number }} cерия {{ episode.Title ? ": " + episode.Title : "" }}
          </div>

          <div class="episode-card__meta box__inline">
            <filter-chips-v2
              v-if="!episode.HasTranslations"
              class="episode-card__tag row label-small v__center h__center"
            >
              <template #text>
                <p class="episode-card__tag-text body-small text__one-line">
                  Нет перевода
                </p>
              </template>
            </filter-chips-v2>

            <filter-chips-v2
              v-if="episode.Stars > 0"
              class="episode-card__tag row label-small gap-8"
            >
              <template #text-icon>
                <Star class="episode-card__icon" />
              </template>
              <template #text>
                <p class="episode-card__tag-text body-small text__one-line h__padding-8">
                  {{ episode.Stars }}
                </p>
              </template>
            </filter-chips-v2>

            <filter-chips-v2
              v-if="episode.Views > 0"
              class="episode-card__tag row label-small"
              :enable-text-icon="true"
            >
              <template #text-icon>
                <Eye class="episode-card__icon" />
              </template>
              <template #text>
                <p class="episode-card__tag-text body-small text__one-line h__padding-8">
                  {{ episode.Views }}
                </p>
              </template>
            </filter-chips-v2>

            <filter-chips-v2 class="episode-card__tag row label-small">
              <template #text>
                <p class="episode-card__tag-text body-small text__one-line h__padding-8">
                  {{ StringExtensions.getDateStr(episode.CreatedAt) }}
                </p>
              </template>
            </filter-chips-v2>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, PropType, ref, watch } from 'vue';
import Star from "@/components/Icons/MaterialIcons/Star.vue";
import Eye from "@/components/Icons/MaterialIcons/Eye.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import FilterChipsV2 from "@/components/UseReadyComponents/MaterialComponents/FilterChipsV2.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import {
  ALL_FILTER,
  Order,
  Translation,
  Translator,
  mapToEpisodeOrderType,
  mapToEpisodes,
  mapToTranslators
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";
import { TranslationService } from "@/api/TranslationService";
import { V1GetByEpisodeRequest } from "@/api/Requests/V1GetByEpisodeRequest";
import { V1GetByEpisodeResponse } from "@/api/Responses/V1GetByEpisodeResponse";
import {StringExtensions} from "../../../helpers/StringExtensions";

const props = defineProps({
  contentId: { type: Number, required: true },
  selectedTranslatorId: { type: Number, required: false, default: null },
  limit: { type: Number, default: 10 },
  offset: { type: Number, default: 0 },
});

const translationService = inject<TranslationService>('translation-service');

// Local State
const episodes = ref<Translation[]>([]);
const translators = ref<Translator[]>([]);
const episodesTotalCount = ref(0);
const isLoading = ref(false);

// Filter State
const translatorFilter = ref<string>(ALL_FILTER);
const sortBy = ref<typeof Order>(Order.ByDefault);
const isOrderByMenuDropped = ref<boolean>(false);
const isSortActive = ref<boolean>(false);
const sortOptions = [Order.ByNumber, Order.ByNumberDescending, Order.ByViews];

// Raw Response Data (для доступа к ID переводчиков)
const episodeTranslationsResponse = ref<V1GetByEpisodeResponse | null>(null);

// Computed
const availableTranslators = computed((): string[] => {
  const names = translators.value.map(x => x.Name).sort();
  return [ALL_FILTER, ...names];
});

const isPagingActive = computed(() => {
  return episodes.value.length < props.offset; // Логику пагинации можно доработать
});

// Methods
const fetchEpisodes = async () => {
  if (!translationService) {
    console.error("TranslationService not provided");
    return;
  }

  isLoading.value = true;

  try {
    let translatorId: number | null = null;

    // Находим ID переводчика по имени, если выбран не ALL_FILTER
    // Важно: берем список переводчиков из предыдущего ответа или null при первом запросе.
    // Если это первый запрос, translatorFilter скорее всего ALL_FILTER.
    if (translatorFilter.value !== ALL_FILTER && episodeTranslationsResponse.value) {
      const found = episodeTranslationsResponse.value.Translators.find(x => x.Name === translatorFilter.value);
      if (found) translatorId = found.Id;
    }

    const request = new V1GetByEpisodeRequest(
      props.contentId,
      null,
      translatorId,
      mapToEpisodeOrderType(sortBy.value)
    );

    const response = await translationService.V1GetByEpisodeAsync(request);
    episodeTranslationsResponse.value = response;

    // Обновляем данные
    episodes.value = mapToEpisodes(response.Episodes);

    // Обновляем список переводчиков только если он пуст (первая загрузка)
    // или если API возвращает всегда актуальный список для данного контента
    if (translators.value.length === 0) {
      translators.value = mapToTranslators(response.Translators);
    }

    // episodesTotalCount.value = ... (если API возвращает общее кол-во)

  } catch (e) {
    console.error("Failed to fetch episodes", e);
  } finally {
    isLoading.value = false;
  }
};

const handleTranslatorUpdate = (value: string) => {
  translatorFilter.value = value;
  fetchEpisodes();
};

const handleSortUpdate = (value: Order) => {
  sortBy.value = value;
  isSortActive.value = true;
  isOrderByMenuDropped.value = false;
  fetchEpisodes();
};

const toggleSortMenu = () => {
  isOrderByMenuDropped.value = !isOrderByMenuDropped.value;
};

onMounted(() => {
  fetchEpisodes();
});

watch(() => props.contentId, () => {
  fetchEpisodes();
});
</script>

<style lang="scss" scoped>
$color-text-dimmed: var(--primary30);
$color-bg-base: var(--primary95);
$color-bg-hover: var(--primary-container-light);
$color-text-hover: var(--on-primary-container-light);
$color-bg-filter-active: var(--primary40);
$color-bg-tag-hover: var(--primary80);

.episodes-list {
  display: grid;
  height: fit-content;
  grid-template-rows: max-content 1fr;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;
  background: $color-bg-base;

  &--with-paging {
    grid-template-rows: 64px 1fr 64px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    padding-bottom: 16px;
    margin: 0 26px;
  }

  &__title-group {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: center;
    align-items: center;
    gap: 24px;
  }

  &__filter {
    height: 32px;
    width: fit-content;
    background: var(--on-primary-light);

    &--active {
      background: $color-bg-filter-active;
      color: var(--on-primary-light);
    }
  }

  &__body {
    padding: 12px 0;
  }

  &__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
}

.episode-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  width: 100%;
  gap: 24px;
  padding: 8px 26px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: $color-text-hover;
    background: $color-bg-hover;
  }

  &__title {
    display: grid;
    width: 100%;
    height: fit-content;
    align-content: center;
    justify-content: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: $color-text-dimmed;
  }

  &__meta {
    display: grid;
    width: 100%;
    height: fit-content;
    align-content: center;
    justify-content: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    gap: 16px;
    color: $color-text-dimmed;
  }

  &__tag {
    color: $color-text-dimmed;
    background: $color-bg-hover;
  }

  &:hover & {
    &__title,
    &__meta {
      color: $color-text-hover;
    }

    &__tag {
      color: $color-text-hover;
      background: $color-bg-tag-hover;
    }

    &__tag-text,
    &__icon {
      color: $color-text-hover;
    }
  }
}
</style>
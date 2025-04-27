<template>
  <div
    v-show="episodes.length > 0"
    class="material m-radius-2 m3-bg-1 main__box"
    :class="{
      'material m3-bg-1 main__box-with-paging': episodes.length < offset
    }"
  >
    <div class="main__header-box col-gap8 row-gap4 dynamic main__margins">
      <div class="main__title-box">
        <h3 class="title-large">
          Эпизоды
        </h3>
        <h4 class="title-large">
          {{ offset }} - {{ offset + episodes.length }} / {{ episodes.length }}
        </h4>
      </div>
      <div class="row col-gap16 row-gap8 dynamic">
        <base-selector
          v-model="translatorFilter"
          class="main__filter-button m-radius-1 m3-bg-3"
          :title="'Переводчик'"
          :selectable-values="selectableTranslators"
          @update:modelValue="(value) => { emits('translator:update', value) }"
        />
        <base-selector
          v-model="orderByFilter"
          class="main__filter-button m-radius-1 m3-bg-3"
          :title="'Сортировка'"
          :selectable-values="[Order.ByNumber, Order.ByNumberDescending, Order.ByStars, Order.ByViews]"
          @update:modelValue="(value) => { emits('sort-by:update', value) }"
        />
      </div>
    </div>
    <div class="main__episodes-box">
      <template
        v-for="episodeTranslation in episodesRef"
        :key="episodeTranslation"
      >
        <router-link :to="{ name: 'episode', params: { content: contentId, episode: episodeTranslation.EpisodeId }}">
          <div class="box__inline main__episode-box">
            <div class="body-large box__inline main__episode-attribute">
              {{ episodeTranslation.Number }} cерия{{ episodeTranslation.Title ? ": "+episodeTranslation.Title : "" }}
            </div>
            <div class="box__inline main__episode-attribute">
              <filter-chips
                v-show="!episodeTranslation.HasTranslations"
                class="m-border"
                :text="'Нет перевода'"
              />
              <div v-if="episodeTranslation.Stars > 0" class="body-large box__inline main__episode-tag">
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
import {computed, PropType, ref, watch} from 'vue';
import Star from "@/components/Icons/MaterialIcons/Star.vue";
import Eye from "@/components/Icons/MaterialIcons/Eye.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import {
  ALL_FILTER,
  Order,
  Translation,
  Translator
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";

const emits = defineEmits<{
  (name: 'sort-by:update', value: typeof Order) : void,
  (name: 'translator:update', value: string) : void
}>();

const props = defineProps({
  contentId: {type: Number, required: true},
  episodes: {type: Object as PropType<Translation[]>, required: true},
  episodesTotalCount: { type: Number, required: true, default: 0},
  translators: {type: Object as PropType<Translator[]>, required: true},
  selectedTranslatorId: {type: Number, required: false, default: null},
  sortBy: {type: String as PropType<typeof Order>, required: false, default: Order.ByNumber},
  limit: {type: Number, required: false, default: 10},
  offset: { type: Number, required: false, default: 0},
});

const episodesRef = ref<Translation[]>(props.episodes);
const translatorFilter = ref<string>();
const orderByFilter = ref<typeof Order>();

watch(() => props.episodes, (newValue: Translation[]) => {
  episodesRef.value = newValue;
})

const selectableTranslators = computed((): string[] => {
  let result = [ALL_FILTER];
  result = [...result, ...props.translators.map(x => x.Name).sort()];
  return result;
});


</script>

<style lang="scss" scoped>
.main {
  &__episodes-box {
    border-top: 1px solid #EEEFF4;
    padding: 12px 0;
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

    color: var(--primary40);
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
    grid-template-rows: max-content 1fr;
    align-items: center;
    padding-top: 8px;
    padding-bottom: 8px;

    &-with-paging {
      grid-template-rows: 64px 1fr 64px;
    }
  }

  &__filter-button {
    height: 32px;
    width: fit-content;

    &:hover {
      background: var(--surface-container-highest90);
    }
  }

  &__episode-box {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    width: 100%;
    gap: 24px;
    padding: 8px 26px;

    &:hover {
      color: var(--on-secondary-container-light);
      background: color-mix(in srgb, var(--primary40) 8%, transparent);;
      cursor: pointer;
    }
  }

  &__header-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    padding-top: 8px;
    padding-bottom: 16px;
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
  }

  &__margins {
    margin: 0 26px;
  }
}
</style>
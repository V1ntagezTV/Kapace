<template>
  <div
    v-show="episodes.length > 0"
    class="m-radius-2 main__box m-border-primary"
    :class="{
      'main__box-with-paging': episodes.length < offset
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
          class="main__filter--static m-radius-1 m-border-primary"
          :title="'Переводчик'"
          :selectable-values="selectableTranslators"
          @update:modelValue="(value) => { emits('translator:update', value) }"
        >
          <filter-chips-v2>
            <template #text>
              <p class="body-medium h__padding-8">
                {{ translatorFilter }}
              </p>
            </template>
          </filter-chips-v2>
        </base-selector>
        <base-selector
          v-model="orderByFilter"
          class="row fit-content"
          :is-dropped="isOrderByMenuDropped"
          :selectable-values="[Order.ByNumber, Order.ByNumberDescending, Order.ByViews]"
          @update:modelValue="(value) => {
            emits('sort-by:update', value)
            orderByFilterSelected = true;
            isOrderByMenuDropped = false;
          }"
        >
          <template #header>
            <filter-chips-v2
              class="main__filter--static m-radius-1 m-border-primary"
              :class="{'main__filter--enabled': orderByFilterSelected}"
              :enable-menu-icon="true"
              @click="isOrderByMenuDropped = !isOrderByMenuDropped;"
            >
              <template #text>
                <p class="body-medium h__padding-8">
                  {{ orderByFilter }}
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
    <div class="main__episodes-box">
      <template
        v-for="episodeTranslation in episodesRef"
        :key="episodeTranslation"
      >
        <router-link :to="{ name: 'episode', params: { content: contentId, episode: episodeTranslation.EpisodeId, translation: selectedTranslatorId }}">
          <div class="box__inline main__episode-box">
            <div class="body-large box__inline main__episode-attribute">
              {{ episodeTranslation.Number }} cерия {{ episodeTranslation.Title ? ": "+episodeTranslation.Title : "" }}
            </div>
            <div class="box__inline main__episode-attribute">
              <filter-chips-v2
                v-if="!episodeTranslation.HasTranslations"
                class="row label-small main__episode-tag v__center h__center"
              >
                <template #text>
                  <p
                    class="main__favorite-tag-title body-small text__one-line"
                    style="color: var(--on-primary-container-light)"
                  >
                    Нет перевода
                  </p>
                </template>
              </filter-chips-v2>
              <filter-chips-v2
                v-if="episodeTranslation.Stars > 0"
                class="row label-small gap-8 main__episode-tag"
              >
                <template #text-icon>
                  <Star style="color: var(--on-primary-container-light)" />
                </template>
                <template #text>
                  <p
                    class="main__favorite-tag-title body-small text__one-line h__padding-8"
                    style="color: var(--on-primary-container-light)"
                  >
                    {{ episodeTranslation.Stars }}
                  </p>
                </template>
              </filter-chips-v2>
              <filter-chips-v2
                v-if="episodeTranslation.Views > 0"
                class="row label-small main__episode-tag"
                :enable-text-icon="true"
              >
                <template #text-icon>
                  <Eye />
                </template>
                <template #text>
                  <p class="profile__favorite-tag-title body-small text__one-line h__padding-8">
                    {{ episodeTranslation.Views }}
                  </p>
                </template>
              </filter-chips-v2>
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
import {
  ALL_FILTER,
  Order,
  Translation,
  Translator
} from "@/components/UseReadyComponents/EpisodesList/TranslationsListViewModel";
import FilterChipsV2 from "@/components/UseReadyComponents/MaterialComponents/FilterChipsV2.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";

const emits = defineEmits<{
  (name: 'sort-by:update', value: typeof Order) : void,
  (name: 'translator:update', value: string) : void
}>();

const props = defineProps({
  contentId: {type: Number, required: true},
  selectedTranslatorId: {type: Number, required: false, default: null},
  episodes: {type: Object as PropType<Translation[]>, required: true},
  translators: {type: Object as PropType<Translator[]>, required: true},
  episodesTotalCount: { type: Number, required: true, default: 0},
  sortBy: {type: Order, required: false, default: Order.ByNumber},
  limit: {type: Number, required: false, default: 10},
  offset: { type: Number, required: false, default: 0},
});

const episodesRef = ref<Translation[]>(props.episodes);
const translatorFilter = ref<string>();

const orderByFilter = ref<typeof Order>(Order.ByDefault);
const isOrderByMenuDropped = ref<boolean>(false)
const orderByFilterSelected = ref<boolean>(false)

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

    color: var(--primary30);
  }

  &__episode-tag {
    color: var(--primary30);
    background: var(--primary-container-light);
  }

  &__episode-tag-title {
    color: var(--on-primary-container-light);
  }

  &__box {
    display: grid;
    height: fit-content;
    grid-template-rows: max-content 1fr;
    align-items: center;
    padding-top: 8px;
    padding-bottom: 8px;
    background: var(--primary95);

    &-with-paging {
      grid-template-rows: 64px 1fr 64px;
    }
  }

  &__filter--static {
    height: 32px;
    width: fit-content;
    background: var(--on-primary-light)
  }

  &__filter--enabled {
    background: var(--primary40);
    color: var(--on-primary-light);
  }

  &__episode-box {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    width: 100%;
    gap: 24px;
    padding: 8px 26px;

    &:hover {
      color: var(--on-primary-container-light);
      background: var(--primary-container-light);
      cursor: pointer;
    }
    &:hover .main__episode-tag {
      color: var(--on-primary-container-light);
      background: var(--primary80);
    }
    &:hover .main__episode-attribute{
      color: var(--on-primary-container-light);
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
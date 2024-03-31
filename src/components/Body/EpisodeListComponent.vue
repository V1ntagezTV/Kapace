<template>
  <BaseBackground :type="2" class="">
    <div class="list__header-box">
      <div class="list__header-title">
        <div class="list__header-text">
          Эпизоды
        </div>

        <div class="list__header-text">
          {{ pagesRange[0] }}-{{ pagesRange[pagesRange.length - 1] }}/{{ viewModel.episodes.length }}
        </div>
      </div>

      <div class="list__header-title">
        <div class="list__header-text">
          Переводчик
        </div>

        <base-drop-menu class="list__" :height="'32px'">
          <template #header="{onClick}">
            <base-button
              class="list__header-translator-box"
              :button-type="3"
              @click="onClick"
            >
              <div class="list__header-translator">
                {{ selectedTranslatorName }}
              </div>
              <drop-arrow />
            </base-button>
          </template>
          <template #menu="{onClick}">
            <div class="list__header-translator-list" @click="onClick">
              <div v-for="translator in viewModel.translators" :key="translator">
                {{ translator.title }}
              </div>
            </div>
          </template>
        </base-drop-menu>
      </div>
    </div>

    <div>
      <router-link
        v-for="episode in showedEpisodes"
        :key="episode"
        :to="{ name: 'episode', params: {
          content: viewModel.contentId,
          episode: episode.episodeId,
          translation: viewModel.currentTranslatorId
        }}"
        :class="{
          'list__episode-box': episode.episodeId !== viewModel.currentEpisodeId,
          'list__episode-box-current': episode.episodeId === viewModel.currentEpisodeId
        }"
        class="list__episode-box"
      >
        <div class="list__episode-title">
          {{ episode.number }} Серия: {{ episode.title }}
        </div>
        <div class="list__episode-details">
          <div class="list__episode-details-unit">
            {{ moment(new Date(1231231241)).format('DD.MM.YYYY') }}
          </div>
          <div class="list__episode-details-unit">
            <secondary-eye-icon />
            {{ 3124 + episode.views }}
          </div>
          <div class="list__episode-details-unit">
            <template v-for="unit in starsRange" :key="unit">
              <stars-icon v-if="unit <= episode.stars" />
              <star-with-border-icon v-else />
            </template>
            {{ episode.stars }}
          </div>
        </div>
      </router-link>
    </div>

    <div class="list__paging-box">
      <v2-base-button class="list__paging-button list__paging-text">
        В начало
      </v2-base-button>
      <span v-if="isShowStartDots">...</span>
      <v2-base-button
        v-for="pageNumber in pagesRange"
        :key="pageNumber"
        :class="{
          'list__paging-text list__paging-number': pageNumber !== viewModel.currentPage - 1,
          'list__paging-text list__paging-number-selected': pageNumber === viewModel.currentPage - 1
        }"
      >
        {{ pageNumber }}
      </v2-base-button>
      <span v-if="isShowEndDots">...</span>
      <v2-base-button class="list__paging-button list__paging-text">
        Дальше
      </v2-base-button>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import moment from 'moment'
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {PropType, ref} from "vue";
import {EpisodeListViewModel, EpisodeTranslationViewModel} from "@/components/Body/ViewModels/EpisodeListViewModel";
import V2BaseButton from "@/components/Base/V2BaseButton.vue";
import SecondaryEyeIcon from "@/components/Icons/SecondaryEyeIcon.vue";
import DropArrow from "@/components/Icons/DropArrow.vue";
import StarsIcon from "@/components/Icons/StarIcon.vue";
import StarWithBorderIcon from "@/components/Icons/StarWithBorderIcon.vue";
import BaseDropMenu from "@/components/Base/BaseDropMenu.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

const maxShowedPages = 8;
const cornerSteps = 2;

const props = defineProps({
  viewModel: {type: Object as PropType<EpisodeListViewModel>, required: true}
});

const selectedTranslatorName = ref(props.viewModel.translatorName);
const isShowStartDots = ref(props.viewModel.currentPage > cornerSteps);
const isShowEndDots = ref(props.viewModel.currentPage < (props.viewModel.episodes.length / props.viewModel.limit) - cornerSteps);

const starsRange = getStarsRange();
const pagesRange = getPagesRange(
  props.viewModel.episodes.length,
  props.viewModel.limit,
  props.viewModel.currentPage,
  maxShowedPages,
  cornerSteps
);

const showedEpisodes = ref(getCurrentEpisodes());
function getCurrentEpisodes() : EpisodeTranslationViewModel[] {
  return props.viewModel.episodes.slice(
    pagesRange[0] - 1,
    pagesRange[0] - 1 + pagesRange.length
  );
}

function getPagesRange(
  episodesCount: number,
  pageLimit: number,
  currentPage: number,
  maxShowedPages: number,
  cornerStep: number
): number[] {
  const result: number[] = [];
  const max: number = episodesCount / pageLimit + 1;
  const min = 1;

  const start = currentPage > cornerStep ? currentPage : min;
  const end = start + maxShowedPages > max
    ? max
    : start + maxShowedPages;

  for (let page = start; page <= end; page++) {
    result.push(page);
  }

  return result;
}

function getStarsRange() {
  const result: number[] = [];

  for (let page = 1; page <= 5; page++) {
    result.push(page);
  }

  return result;
}
</script>

<style scoped lang="scss">
.list {
  &__header {
    &-box {
      display: flex;
      padding: 20px;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      align-self: stretch;
    }

    &-text {
      color: var(--gray-gray-2, #474A57);
      text-align: justify;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 0.32px;
    }

    &-title {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    &-translator {
      color: var(--palette-main-blue, #577399);
      text-align: justify;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 0.32px;
    }

    &-translator-box {
      display: flex;
      align-self: end;
      width: fit-content;
      padding: 6px 10px;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      float: right;
      border-radius: 6px;
      background: var(--gray-gray-5, #EEEFF4);

      &:hover {
        cursor: pointer;
        background: #E6E9F2;
      }
    }

    &-translator-list {
      display: flex;
      padding: 8px 0;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;

      border-radius: 6px;
      border: 0.5px solid var(--palette-main-blue, #577399);
      //box-shadow: 0 0 0 1px #577399;
      box-suppress: show;
      background: var(--font-gray-v3);

      overflow: hidden;
      color: var(--palette-main-blue, #577399);
      text-align: justify;
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 0.28px;

      & div {
        display: flex;
        padding: 6px 10px;
        align-items: center;
        gap: 10px;
        align-self: stretch;

        &:hover {
          cursor: pointer;
          background: #E6E9F2;
        }
      }
    }
  }


  &__paging {
    &-box {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      width: 100%;

      padding: 14px 18px;
      align-items: center;
      gap: 12px;

      border-top: 1px solid var(--gray-gray-5, #EEEFF4);

      & * {
        width: fit-content;
      }
    }

    &-button {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 6px 12px;
      height: 100%;

      font-size: 12px;
      color: var(--gray-gray-6, #F4F5F7);

      background: var(--palette-main-blue, #577399);

      &:hover {
        background: var(--palette-main-blue, #4f6a8a);
        cursor: pointer;
      }
    }

    &-number {
      display: flex;
      padding: 6px 12px;
      flex-direction: column;
      align-items: flex-start;
      font-size: 16px;

      color: var(--palette-main-blue, #577399);

      &:hover {
        background: var(--font-gray-v2);
        cursor: pointer;
      }
    }

    &-number-selected {
      display: flex;
      padding: 6px 12px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;

      color: white;
      background: var(--secondary);

      &:hover {
        background: var(--secondary-hover, #ce605c);
        cursor: pointer;
      }
    }

    &-text {
      text-align: justify;
      font-family: Inter;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      letter-spacing: 0.24px;
    }
  }

  &__episode {
    &-box {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      align-items: center;
      align-self: stretch;

      &:hover {
        background: var(--gray-gray-6, #F4F5F7);
        cursor: pointer;
      }

      &-current {
        background: var(--font-gray-v3);
      }
    }

    &-title {
      color: var(--gray-gray-2, #474A57);
      text-align: justify;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 0.28px;
    }

    &-details {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }

    &-details-unit {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;

      color: var(--gray-gray-3, #969BAB);
      text-align: justify;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 0.24px;
    }
  }
}

</style>
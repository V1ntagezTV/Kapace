<template>
  <div class="edit-episode__right-box m-radius-16">
    <h3 class="title-large edit-episode__page-header">
      Основная информация
    </h3>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__box-activities">
        <p class="body-large">
          Дорама*
        </p>
        <p class="body-large">
          Серия*
        </p>
        <async-search-selector
          :input="contentInput"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :placeholder="'Выберите дораму'"
          :values="searchContentListV2.map(x => x.Title)"
          :is-invalid="contentIsInvalid"
          :is-dropped="isContentsMenuDropped"
          :call-updater-delay="500"
          @change:input="onChangeContentInput"
        />
        <BaseInput
          v-model="episodeSelectedTitle"
          class="edit-episode__bg m3-bg-1 m-radius-1 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="episodeIsInvalid"
          :place-holder="'Выберите серию'"
          type="number"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__box-activities">
        <p class="body-large">
          Язык перевода*
        </p>

        <p class="body-large">
          Тип перевода*
        </p>
        <BaseSelector
          v-model="language"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :title="'Выберите язык'"
          :mark-as-invalid-input="languageIsInvalid"
          :selectable-values="languageSelectableValues"
        />
        <BaseSelector
          v-model="translationType"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :title="'Выберите тип перевода'"
          :mark-as-invalid-input="translationTypeIsInvalid"
          :selectable-values="translationTypeSelectableValues"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__box-activities">
        <p class="body-large">
          Переводчик
        </p>
        <p class="body-large">
          Качество видео
        </p>
        <async-search-selector
          v-model="translatorSelectedTitle"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :placeholder="'Выберите переводчика'"
          :values="translatorsList.map(translator => translator.Name)"
          :is-dropped="isTranslatorsMenuDropped"
          :call-updater-delay="500"
          @change:input="onChangeTranslatorInput"
        />
        <BaseSelector
          v-model="quality"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :title="'Выберите качество'"
          :selectable-values="[
            VideoQuality['720p'].toString(),
            VideoQuality['1080p'].toString(),
            VideoQuality['1440p'].toString(),
            VideoQuality['2160p'].toString()
          ]"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box gap-8">
      <div class="column gap-8">
        <div class="edit-episode__details">
          <p class="body-large">
            Скрипт видео*
          </p>
        </div>
        <BaseTextArea
          v-model="userInputVideo"
          class="edit-episode__video-input edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :placeholder="'Вставьте скрип-видео'"
          :mark-as-invalid-input="videoScriptIsInvalid"
        />
        <div class="edit-episode__video-box m3-bg-5 column gap-8 m-radius-1">
          <iframe
            width="100%" height="100%"
            class="edit-episode__video m-radius-1"
            allowfullscreen="allowfullscreen"
            :src="videoLink"
          />
          <div class="edit-episode__video-recommendation m-border m-radius-1">
            <p>Убедитесь, что видео показывается и корректно работает.</p>
          </div>
        </div>
        <base-button
          :variant="'outline'"
          class="material m-border m-border-hover m-radius-1"
          @click="getVideoLink"
        >
          Вывести видео
        </base-button>
      </div>
    </div>

    <div class="edit-episode__buttons-box">
      <base-button
        class="m-radius-circle"
        :variant="'filled'"
        @click="onClickUpsertEpisode"
      >
        Отправить
      </base-button>
      <base-button
        :variant="'outline'"
        class="m-border m-border-hover m-radius-circle"
      >
        Сбросить
      </base-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInput from "@/components/Base/BaseInput.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseTextArea from "@/components/Base/BaseTextArea.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import { useEpisodeEditor } from "@/composables/edits/useEpisodeEditor";
import { toRef } from "vue";

const props = defineProps<{
  contentId: string | null;
  episodeId: number | null;
}>();

const {
  VideoQuality,
  searchContentListV2,
  contentIsInvalid,
  contentInput,
  episodeSelectedTitle,
  episodeIsInvalid,
  isContentsMenuDropped,
  language,
  languageIsInvalid,
  languageSelectableValues,
  translationType,
  translationTypeIsInvalid,
  translationTypeSelectableValues,
  translatorSelectedTitle,
  translatorsList,
  isTranslatorsMenuDropped,
  quality,
  userInputVideo,
  videoLink,
  videoScriptIsInvalid,
  getVideoLink,
  onClickUpsertEpisode,
  onChangeContentInput,
  onChangeTranslatorInput,
} = useEpisodeEditor(toRef(props, 'contentId'), toRef(props, 'episodeId'));
</script>

<style lang="scss" scoped>
.edit-episode {
  &__buttons-rowed {
    display: flex;
    height: fit-content;
    gap: 8px;
  }

  &__bg {
    background: var(--surface-container-default94);
    transition:
      background-color 0.2s,
      border-top-color 0.15s,
      border-bottom-color 0.15s,
      border-right-color 0.15s,
      border-left-color 0.15s;

    &:hover {
      background: var(--surface-container-high92);
    }
  }

  &__page-header {
    text-align: start;
  }

  &__buttons-box {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: min-content;
    grid-auto-flow: column;
    grid-gap: 20px;
    justify-content: start;

    & button {
      width: fit-content;
      padding-left: 26px;
      padding-right: 26px;
    }
  }

  &__box-activities {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 8px;
    column-gap: 16px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
    text-align: start;
  }

  &__box-activities-column {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content(100%);
    grid-gap: 8px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
  }

  &__text-button {
    width: fit-content;
    color: var(--primary40);
  }

  &__splitter {
    width: 100%;
    background: var(--font-gray-v2);
    height: 100%;
  }

  &__box {
    display: grid;
    grid-template-columns: 250px 1px 1fr;
    grid-template-rows: max-content;
    height: fit-content;
  }

  &__right-box {
    display: grid;
    background: var(--primary98);
    grid-template-rows: min-content;
    grid-auto-rows: min-content;
    padding: 20px;
    gap: 26px;
  }

  &__unit-box {
    display: grid;
    height: fit-content;
    grid-gap: 16px;
  }

  &__details {
    display: grid;
    justify-items: start;
    grid-auto-rows: min-content;

    text-align: start;
    & * {
      padding: 0;
      margin: 0;
    }
  }

  &__video-input {
    min-height: 115px;
  }

  &__video {
    display: flex;
    border: none;
    outline: none;
  }

  &__video-box {
    width: 100%;
    height: 350px;
    padding: 8px;
  }

  &__video-recommendation {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
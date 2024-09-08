<template>
  <div class="edit-episode__right-box">
    <h3 class="edit-episode__page-header">
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
          class="edit-episode__bg m-radius-1"
          :placeholder="'Выберите дораму'"
          :values="contentSelectableValues"
          :is-invalid="contentIsInvalid"
          @change:input="onChangeContentInput"
        />
        <BaseInput
          v-model="episodeSelectedTitle"
          class="edit-episode__bg m3-bg-1 m-radius-1"
          :mark-as-invalid-input="episodeIsInvalid"
          :place-holder="'Выберите серию'"
          type="number"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__box-activities">
        <p class="body-large">
          Переводчик*
        </p>
        <p class="body-large">
          Тип перевода*
        </p>
        <async-search-selector
          v-model="translatorSelectedTitle"
          class="edit-episode__bg m-radius-1"
          :placeholder="'Выберите переводчика'"
          :values="translatorSelectableValues"
          :is-invalid="translatorIsInvalid"
          @change:input="onChangeTranslatorInput"
        />
        <BaseSelector
          v-model="translationType"
          class="edit-episode__bg m-radius-1"
          :title="'Выберите тип перевода'"
          :is-disabled="translatorSelectableValues === undefined"
          :mark-as-invalid-input="translationTypeIsInvalid"
          :selectable-values="translationTypeSelectableValues"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__box-activities">
        <p class="body-large">
          Язык перевода*
        </p>
        <p class="body-large">
          Качество видео
        </p>
        <BaseSelector
          v-model="language"
          class="edit-episode__bg m-radius-1"
          :title="'Выберите язык'"
          :mark-as-invalid-input="languageIsInvalid"
          :selectable-values="languageSelectableValues"
        />
        <BaseSelector
          v-model="quality"
          class="edit-episode__bg m3-bg-1 m-radius-1"
          :title="'Выберите качество'"
          :selectable-values="[VideoQuality['720p'], VideoQuality['1080p'], VideoQuality['1440p'], VideoQuality['2160p']]"
        />
      </div>
    </div>

    <div class="edit-episode__unit-box">
      <div class="edit-episode__details">
        <p class="body-large">
          Скрипт видео*
        </p>
      </div>
      <BaseTextArea
        v-model="videoScript"
        class="edit-episode__description-input edit-episode__bg m-radius-1"
        :placeholder="'Вставьте скрип-видео'"
        :mark-as-invalid-input="videoScriptIsInvalid"
      />
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
        class="m-radius-circle"
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
import {inject, ref} from "vue";
import {TranslationType} from "@/api/Enums/TranslationType";
import {Language, VideoQuality} from "@/api/Enums/Language";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {ContentService, V1SearchByResponseUnit} from "@/api/ContentService";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import {EpisodeService, V1EpisodeQueryRequest} from "@/api/EpisodeService";
import {TranslatorService, V1TranslatorQueryResponseUnit} from "@/api/TranslatorService";

const changesHistoryApi = inject<ChangesHistoryService>('changes-history-service');
const contentApi = inject<ContentService>("content-service");
const episodesApi = inject<EpisodeService>('episode-service');
const translatorApi = inject<TranslatorService>('translator-service');

/* Дорама */
let searchContentList: V1SearchByResponseUnit[] = [];
const contentSelectableValues = ref<string[]>([]);
const contentIsInvalid = ref<boolean>(false);
const contentSelectedTitle = ref<string | undefined>();

/* Серия */
const episodeSelectableValues = ref<string[]>([]);
const episodeIsInvalid = ref<boolean>(false);
const episodeSelectedTitle = ref<string>('');

/* Переводчик */
let translatorsList: V1TranslatorQueryResponseUnit[] = [];
const translatorSelectableValues = ref<string[]>([]);
const translatorIsInvalid = ref<boolean>(false);
const translatorSelectedTitle = ref<string>('');

/* Тип перевода */
const translationType = ref<string>();
const translationTypeIsInvalid = ref<boolean>(false);
const translationTypeSelectableValues = [
  TranslationType.Subtitles,
  TranslationType.AutoSubtitles,
  TranslationType.Original,
  TranslationType.VoiceActing
];

/* Качество */
const quality = ref<string>('');

/* Язык */
const language = ref<string>();
const languageIsInvalid = ref<boolean>(false);
const languageSelectableValues = [Language.Russian, Language.English, Language.Korean, Language.Chinese, Language.Japanese];

/* Видео */
const videoScript = ref<string>();
const videoScriptIsInvalid = ref<boolean>(false);

async function onClickUpsertEpisode() {
  const isValidString = (value: string) => value != null && value.trim() != "";

  contentIsInvalid.value = !isValidString(contentSelectedTitle.value);
  /* Эпизод валидный только если выбран контент и эпизод */
  episodeIsInvalid.value = !isValidString(episodeSelectedTitle.value) || contentIsInvalid.value;
  translatorIsInvalid.value = !isValidString(translatorSelectedTitle.value);
  languageIsInvalid.value = !isValidString(language.value);
  translationTypeIsInvalid.value = !isValidString(translationType.value);

  if (!contentIsInvalid.value &&
    !episodeIsInvalid.value &&
    !translatorIsInvalid.value &&
    !translationTypeIsInvalid.value &&
    !languageIsInvalid.value) {
    const content = searchContentList.find(content => content.Title === contentSelectedTitle.value);
    const episode = episodeSelectedTitle.value as number;
    const languageType = language.value as typeof Language;
    const translationTypeValue = translationType.value as typeof TranslationType;
    const qualityNumber = quality.value as VideoQuality as number;
    const translatorId = translatorsList
      .find(translator => translator.Name === translatorSelectedTitle.value)
      .TranslatorId;

    // TODO: Если передали iframe а не ссылку на видео из src то нужно вытащить из него ссылку
    await changesHistoryApi.createEpisodeChange({
      ChangeableFields: {
        Number: episode,
        VideoScript: videoScript.value,
        Language: languageType,
        TranslationType: translationTypeValue,
        EpisodeId: null,
        TranslatorId: translatorId,
        Quality: qualityNumber,
      },
      ContentId: content.ContentId,
      CreatedBy: 0
    });
    return;
  }

  console.log('invalid')
}

/* Вызывается при изменении input дорамы */
async function onChangeContentInput(newInput: string, isSelected: boolean) {
  contentSelectedTitle.value = isSelected ? newInput : undefined;

  if (newInput.length === 0) {
    contentSelectableValues.value = [];
    return;
  }

  if (isSelected) {
    const selectedContent = searchContentList.find(content => content.Title === newInput);
    const episodesRequest = new V1EpisodeQueryRequest();
    episodesRequest.ContentIds = [selectedContent.ContentId];
    const episodes = await episodesApi.query(episodesRequest);

    episodeSelectableValues.value = episodes.map(ep => ep.Number.toString());
    return;
  } else {
    episodeSelectableValues.value = [];
  }

  searchContentList = (await contentApi.searchBy(newInput)).Units;
  contentSelectableValues.value = searchContentList.map(x => x.Title);
}

/* Вызывается при изменении input переводчика */
async function onChangeTranslatorInput(newInput: string, isSelected: boolean) {
  translatorSelectedTitle.value = isSelected ? newInput : undefined;

  if (newInput.length === 0) {
    translatorsList = [];
    return;
  }

  const translatorsResponse = await translatorApi.query({
    Limit: 7,
    Offset: null,
    Search: newInput,
    TranslatorIds: null
  });
  translatorSelectableValues.value = translatorsResponse.Translators.map(x => x.Name);
  translatorsList = translatorsResponse.Translators;
}
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
    transition: background-color 0.2s;

    &:hover {
      background: var(--surface-container-high92);
    }
  }

  &__page-header {
    color: var(--dark-primary);
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
    background: var(--surface-container-lowest100);
    grid-template-rows: min-content;
    grid-auto-rows: min-content;
    gap: 30px;
    padding-left: 80px;
    padding-right: 80px;
    padding-bottom: 60px;
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

  &__description-input {
    resize: vertical;
    width: 100%;
  }
}

</style>
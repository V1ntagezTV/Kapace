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
          Переводчик*
        </p>
        <p class="body-large">
          Тип перевода*
        </p>
        <async-search-selector
          v-model="translatorSelectedTitle"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :placeholder="'Выберите переводчика'"
          :values="translatorsList.map(translator => translator.Name)"
          :is-invalid="translatorIsInvalid"
          :is-dropped="isTranslatorsMenuDropped"
          :call-updater-delay="500"
          @change:input="onChangeTranslatorInput"
        />
        <BaseSelector
          v-model="translationType"
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
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
          class="edit-episode__bg m-radius-1 m-border m-border-hover m-border-active"
          :title="'Выберите язык'"
          :mark-as-invalid-input="languageIsInvalid"
          :selectable-values="languageSelectableValues"
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
import {inject, onMounted, ref} from "vue";
import {TranslationType} from "@/api/Enums/TranslationType";
import {Language, VideoQuality} from "@/api/Enums/Language";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {ContentService} from "@/api/ContentService";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import {EpisodeService, V1EpisodeQueryRequest} from "@/api/EpisodeService";
import {TranslatorService, V1TranslatorQueryResponseUnit} from "@/api/TranslatorService";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";

type UnitOfSelection = {
  ContentId: number,
  Title: string
};

const props = defineProps({
  contentId: {type: Number, required: true, default: null},
  episodeId: {type: Number, required: true, default: null}
});

const changesHistoryApi = inject<ChangesHistoryService>('changes-history-service');
const contentApi = inject<ContentService>("content-service");
const episodesApi = inject<EpisodeService>('episode-service');
const translatorApi = inject<TranslatorService>('translator-service');
const clientEventStore = ClientEventStore();

onMounted(async () => {
  if (props.contentId) {
    const contentInfo = await contentApi.V1GetById(props.contentId, 0);
    searchContentListV2.value = [{ContentId: contentInfo.Content.Id, Title: contentInfo.Content.Title}];
    contentSelectedTitle.value = contentInfo.Content.Title;
    contentInput.value = contentInfo.Content.Title;
  }

  if (props.episodeId && props.contentId) {
    const request = new V1EpisodeQueryRequest();
    request.EpisodeIds = [props.episodeId];
    request.ContentIds = [props.contentId];
    request.Limit = 1;

    const episodesQuery = await episodesApi.query(request);
    if (episodesQuery?.length > 0) {
      const episode = episodesQuery[0];
      episodeSelectedTitle.value = episode.Title;
      episodeSelectableValues.value = [episode.Title];
    }
  }
});

/* Дорама */
let searchContentListV2 = ref<UnitOfSelection[]>([]);
const contentIsInvalid = ref<boolean>(false);
const contentInput = ref<string>("");
const contentSelectedTitle = ref<string>("");
const isContentsMenuDropped = ref<boolean>(false);

/* Серия */
const episodeSelectableValues = ref<string[]>([]);
const episodeIsInvalid = ref<boolean>(false);
const episodeSelectedTitle = ref<string>('');

/* Переводчик */
let translatorsList: V1TranslatorQueryResponseUnit[] = [];
const translatorSelectableValues = ref<string[]>([]);
const translatorIsInvalid = ref<boolean>(false);
const translatorSelectedTitle = ref<string>("");
const isTranslatorsMenuDropped = ref<boolean>(false);

/* Тип перевода */
const translationType = ref<string>("");
const translationTypeIsInvalid = ref<boolean>(false);
const translationTypeSelectableValues = [
  TranslationType.Subtitles,
  TranslationType.AutoSubtitles,
  TranslationType.Original,
  TranslationType.VoiceActing
];

/* Качество */
const quality = ref<string | null>();

/* Язык */
const language = ref<string>();
const languageIsInvalid = ref<boolean>(false);
const languageSelectableValues = [Language.Russian, Language.English, Language.Korean, Language.Chinese, Language.Japanese];

//#region Видео
const videoLink = ref<string>();
const userInputVideo = ref<string>("");
const videoScriptIsInvalid = ref<boolean>(false);

function getVideoLink() {
  videoLink.value = getVideoLinkFromUserInput(userInputVideo.value);
  if (videoLink.value) {
    return;
  }

  videoScriptIsInvalid.value = true;
  clientEventStore.push("Ошибка! Не удалось вывести видео.", EventTypes.Error)
}

function getVideoLinkFromUserInput(userInputVideo: string) {
  if (userInputVideo.startsWith("<iframe") && userInputVideo.endsWith("</iframe>")) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(userInputVideo, 'text/html');

    if (doc.documentElement.querySelector('parsererror')) {
      return tryGetFirstLink(userInputVideo);
    } else {
      return doc.getElementsByTagName('iframe')[0].src;
    }
  } else {
    console.log('link');
    return tryGetFirstLink(userInputVideo);
  }
}

function tryGetFirstLink(userInput) {
  const res = userInput.match(/(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res !== null && res.length > 0) {
    return res[0];
  }

  return null;
}
//endregion
async function onClickUpsertEpisode() {
  const isValidString = (value: string) => value != null && value.trim() != "";

  contentIsInvalid.value = !isValidString(contentSelectedTitle.value);
  /* Эпизод валидный только если выбран контент и эпизод */
  episodeIsInvalid.value = !isValidString(episodeSelectedTitle.value) || contentIsInvalid.value;
  translatorIsInvalid.value = !isValidString(translatorSelectedTitle.value);
  languageIsInvalid.value = !isValidString(language.value);
  translationTypeIsInvalid.value = !isValidString(translationType.value);
  videoScriptIsInvalid.value = !isValidString(videoLink.value);
  if (!contentIsInvalid.value &&
    !episodeIsInvalid.value &&
    !translatorIsInvalid.value &&
    !translationTypeIsInvalid.value &&
    !languageIsInvalid.value &&
    !videoScriptIsInvalid.value) {

    console.log(quality.value as VideoQuality as number);
    const content = searchContentListV2.value.find(content => content.Title === contentSelectedTitle.value);
    const episode = episodeSelectedTitle.value as number;
    const languageType = language.value as typeof Language;
    const translationTypeValue = translationType.value as typeof TranslationType;
    const qualityNumber = quality.value ? (quality.value as VideoQuality) as number : null;
    const translatorId = translatorsList
      .find(translator => translator.Name === translatorSelectedTitle.value)
      .TranslatorId;

    // TODO: Если передали iframe а не ссылку на видео из src то нужно вытащить из него ссылку
    const response = await changesHistoryApi.createEpisodeChange({
      ChangeableFields: {
        Number: episode,
        VideoScript: videoLink.value,
        Language: languageType,
        TranslationType: translationTypeValue,
        EpisodeId: null,
        TranslatorId: translatorId,
        Quality: qualityNumber,
      },
      ContentId: content.ContentId,
      CreatedBy: 0
    });

    if (response.ok) {
      clientEventStore.push("Успех! Данные отправлены. За их статусом можно следить на странице с обновлениями.", EventTypes.Success)
    } else {
      clientEventStore.push("Ошибка! Что-то пошло не так в момент отправки данных, попробуйте еще раз через некоторое время.", EventTypes.Error)
    }
    return;
  } else {
    clientEventStore.push("Ошибка! Заполните обязательные поля.", EventTypes.Error)
  }
}

/* Вызывается при изменении input дорамы */
async function onChangeContentInput(newInput: string, isSelected: boolean) {
  isTranslatorsMenuDropped.value = false;
  contentSelectedTitle.value = isSelected ? newInput : undefined;
  if (newInput.length === 0) {
    searchContentListV2.value = [];
    isContentsMenuDropped.value = false;
    return;
  }

  if (isSelected) {
    const selectedContent = searchContentListV2.value.find(content => content.Title === newInput);
    const episodesRequest = new V1EpisodeQueryRequest();
    episodesRequest.ContentIds = [selectedContent.ContentId];
    const episodes = await episodesApi.query(episodesRequest);

    episodeSelectableValues.value = episodes.map(ep => ep.Number.toString());
    return;
  } else {
    episodeSelectableValues.value = [];
  }

  const foundContents = (await contentApi.searchBy(newInput)).Units;
  searchContentListV2.value = foundContents.map(content => ({Title: content.Title, ContentId: content.ContentId}));
  if (searchContentListV2.value.length > 0) {
    isContentsMenuDropped.value = true;
  }
}

/* Вызывается при изменении input переводчика */

async function onChangeTranslatorInput(newInput: string, isSelected: boolean) {
  translatorSelectedTitle.value = isSelected ? newInput : undefined;

  if (newInput.length === 0) {
    translatorsList = [];
    isTranslatorsMenuDropped.value = false;
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

  if (translatorSelectableValues.value.length > 0) {
    isTranslatorsMenuDropped.value = true;
  }
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
    margin: 20px 12px;
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
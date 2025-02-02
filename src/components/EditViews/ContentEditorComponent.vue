<template>
  <div class="content-edit__right-box m-radius-16">
    <h3 class="title-large content-edit__header">
      Основная информация
    </h3>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Изображение
        </p>
        <label class="body-medium">Выберите изображение для главной страницы содержимого</label>
      </div>
      <BaseImageInput class="m3-bg-2" @on:update="updateImage" />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities-column">
        <div class="content-edit__box-activities row gap-16">
          <p class="body-large">
            Название
          </p>
          <p class="body-large">
            Статус
          </p>
          <BaseInput
            v-model="title"
            class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
            :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Title"
            :place-holder="'Введите русское название*'"
          />
          <BaseSelector
            v-model="contentStatus"
            class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
            :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.ContentStatus"
            :title="'Выберите статус'"
            :selectable-values="[ContentStatus.Announced, ContentStatus.Ongoing, ContentStatus.Stopped, ContentStatus.Finished]"
          />
        </div>

        <BaseInput
          v-show="showEngTitleInputField"
          v-model="engTitle"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :place-holder="'Введите английское название'"
        />
        <BaseInput
          v-show="showOriginTitleInputField"
          v-model="originalTitle"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :place-holder="'Введите оригинальное название'"
        />

        <div class="content-edit__buttons-rowed">
          <BaseTextButton
            v-show="!showEngTitleInputField"
            class="material m-radius-circle content-edit__text-button"
            @click="() => showEngTitleInputField = !showEngTitleInputField"
          >
            Добавить английское название
          </BaseTextButton>
          <BaseTextButton
            v-show="!showOriginTitleInputField"
            class="material m-radius-circle content-edit__text-button"
            @click="() => showOriginTitleInputField = !showOriginTitleInputField"
          >
            Добавить оригинальное название
          </BaseTextButton>
        </div>
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities">
        <p class="body-large">
          Страна
        </p>
        <label class="body-large">
          Тип дорамы
        </label>
        <BaseSelector
          v-model="country"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Country"
          :title="'Выберите страну'"
          :selectable-values="[Country.Japan, Country.China, Country.Korea]"
        />
        <BaseSelector
          v-model="contentType"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.ContentType"
          :title="'Выберите тип'"
          :selectable-values="[ContentType.Serial, ContentType.Film, ContentType.Show, ContentType.Documentary]"
        />
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Описание
        </p>
      </div>
      <BaseTextArea
        v-model="description"
        class="content-edit__description-input content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
        :placeholder="'Введите описание'"
        :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Description"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Жанры
        </p>
        <label class="body-medium">
          * Подсказка: детектив, драма, триллер<br>
          * Вводите жанры через пробел
        </label>
      </div>
      <div v-show="genres?.length > 0" class="column gap-8">
        <div class="content-edit__genres-selected row gap-8">
          <filter-chips
            v-for="genreName in genres" :key="genreName"
            class="m3-bg-3 m-border m-radius-circle"
            :text="genreName"
            :enable-menu-icon="true"
            @click="deleteSelectedGenre(genreName)"
          >
            <template #menu-icon>
              <x-icon />
            </template>
          </filter-chips>
        </div>
      </div>
      <async-search-selector
        class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
        :placeholder="'Введите имя жанра'"
        :menu-alignment="MenuAlignment.Left"
        :show-loop-icon="false"
        :values="genreSelectableValues"
        :input="genreInput"
        @change:input="onChangeGenreInput"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities">
        <p class="body-large">
          Длительность серии
        </p>
        <p class="body-large">
          Дата релиза
        </p>
      </div>
      <div class="content-edit__box-activities">
        <TimePicker
          v-model="duration"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          @update:model-value="(newValue) => duration = newValue"
        />
        <YearPicker
          v-model="releasedAt"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          @update:model-value="(date) => console.log(date)"
        />
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities">
        <p class="body-large">
          Планируемое количество серий
        </p>
        <p class="body-large">
          Возрастное ограничение
        </p>
      </div>
      <div class="content-edit__box-activities">
        <BaseInput
          v-model="plannedSeries"
          type="number"
          place-holder="Введите число"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
        />
        <BaseInput
          v-model="minAge"
          type="number"
          place-holder="Введите число"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
        />
      </div>
    </div>

    <div class="content-edit__buttons-box">
      <base-button
        class="material m-radius-circle"
        :variant="'filled'"
        @click="onClickInsertContent"
      >
        Отправить
      </base-button>
      <base-button
        :variant="'outline'"
        class="material m-border m-radius-circle"
      >
        Сбросить
      </base-button>
      <base-button @click="() => console.log(durationInMinutes(duration))"></base-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInput from "@/components/Base/BaseInput.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import TimePicker from "@/components/Base/TimePicker.vue";
import YearPicker from "@/components/Base/DatePicker.vue";
import BaseTextArea from "@/components/Base/BaseTextArea.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {Country} from "@/api/Enums/Country";
import {ContentType} from "@/api/Enums/ContentType";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {computed, inject, onMounted, PropType, ref} from "vue";
import BaseImageInput from "@/components/Base/BaseImageInput.vue";
import {ImageService} from "@/api/ImageService";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {Linter} from "eslint";
import FlatConfigFileSpec = Linter.FlatConfigFileSpec;
import {V1ChangeableFields} from "@/api/Requests/V1CreateContentRequest";
import '@material/web/button/filled-button.js';
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import {GenreService} from "@/api/GenreService";
import {GenreQueryResponseGenre} from "@/api/Responses/GenreQueryResponse";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {ContentService} from "@/api/ContentService";
import moment from "moment";
import {StringExtensions} from "@/helpers/StringExtensions";

const props = defineProps({
  contentId: {type: Object as PropType<number | any>, required: false, default: undefined}
});

const showEngTitleInputField = ref<Boolean>(false);
const showOriginTitleInputField = ref<Boolean>(false);

const contentService = inject<ContentService>('content-service');
const imageService = inject<ImageService>('image-service');
const changesHistoryService = inject<ChangesHistoryService>('changes-history-service');
const genreService = inject<GenreService>('genre-service');
const clientEventStore = new ClientEventStore();

let currentImage: FlatConfigFileSpec | FlatConfigFileSpec[];

const title= ref<string | null>(null);
const engTitle = ref<string | null>(null);
const originalTitle = ref<string | null>(null);
const description = ref<string | null>(null);
const country = ref<typeof Country | null>(null);
const contentType = ref<typeof ContentType | null>(null);
const contentStatus = ref<typeof ContentStatus | null>(null);
const genres = ref<string[]>([]);
const duration = ref<string | null>(null);
const releasedAt = ref<string | null>(null);
const plannedSeries = ref<number | null>(null);
const minAge = ref<number | null>(null);
const channel = ref<string | null>(null);

onMounted(async() => {
  if (props.contentId && props.contentId > 0) {
    const content = await contentService.V1GetById(props.contentId, 0);
    title.value = content.Content.Title;
    contentType.value = content.Content.Type;
    contentStatus.value = content.Content.Status;
    genres.value = content.Genres.map(x => x.Name);
    country.value = content.Content.Country;
    description.value = content.Content.Description;
    duration.value = minTwoDigits(Math.trunc(content.Content.Duration / 60)) + ":" + (content.Content.Duration % 60);
    engTitle.value = content.Content.EngTitle;
    minAge.value = content.Content.MinAgeLimit;
    originalTitle.value = content.Content.OriginTitle;
    plannedSeries.value = content.Content.PlannedSeries;
    releasedAt.value = formatDate(content.Content.ReleasedAt);
    channel.value = null;

    showEngTitleInputField.value = (engTitle.value?.length ?? 0) > 0;
    showOriginTitleInputField.value = (originalTitle?.value?.length ?? 0) > 0;
  }
});
function formatDate(date) {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    month = minTwoDigits(month);
    day =  minTwoDigits(day);

  return [year, month, day].join('-');
}

function minTwoDigits(n) {
  return (n < 10 ? '0' : '') + n;
}

const isMarkAsInvalidRequiredProperties = ref({
  Title: false,
  Description: false,
  Country: false,
  ContentType: false,
  ContentStatus: false
});

//#region Genres
const genreInput = ref<string>('');
const genresQuery = ref<GenreQueryResponseGenre[]>([]);
const genreSelectableValues = computed(() => genresQuery.value.map(g => g.Name));

async function onChangeGenreInput(input: string, isSelected: boolean) {
  if (!isSelected) {
    if (StringExtensions.isNullOrEmpty(input)) {
      return;
    }

    const genres = await genreService.Query({
      Search: input,
      GenreIds: undefined,
      Names: undefined,
      Limit: 5,
      Offset: undefined
    });

    genreInput.value = input;
    genresQuery.value = genres.Genres;
  } else {
    const isAlreadySelected = genres.value.find(genreName => genreName === input);
    if (!isAlreadySelected) {
      genres.value.push(input);
    }

    genreInput.value = '';
    genresQuery.value = [];
  }
}

function deleteSelectedGenre(genreName: string) {
  genres.value = genres.value.filter(genre => genre !== genreName);
}
//endregion
const durationInMinutes = (duration: string): number | null => {
  if (!duration) {
    return null;
  }

  const values = duration.split(':');
  const hours: number = parseInt(values[0]);
  const minutes: number = parseInt(values[1]);

  return (hours * 60) + minutes;
};

async function onClickInsertContent() {
  const request: V1ChangeableFields = {
    Channel: channel.value,
    ContentStatus: contentStatus.value,
    ContentType: contentType.value,
    Country: country.value,
    Description: description.value,
    Duration:  durationInMinutes(duration.value),
    EngTitle: engTitle.value,
    Genres: genres.value,
    MinAge: minAge.value,
    OriginalTitle: originalTitle.value,
    PlannedSeries: plannedSeries.value,
    ReleasedAt: releasedAt.value,
    Title: title.value
  };

  if (!IsAllRequiredPropertiesValid(request)) {
    clientEventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error)
    return;
  }

  try {
    const response = await changesHistoryService.createContentChange({
      ChangeableFields: request,
      ContentId: props.contentId ?? 0,
      CreatedBy: 0
    });
    if (currentImage != null) {
      await imageService.insertImage(props.contentId ?? null, response.HistoryId, currentImage);
    }

    clientEventStore.push('Успех! Заявка на добавление изменений создано.')
  } catch (exception) {
    clientEventStore.push('Ошибка! Неизвестная ошибка сервера.')
  }
}

async function updateImage(image: FlatConfigFileSpec | FlatConfigFileSpec[]) {
  currentImage = image;
}

function IsAllRequiredPropertiesValid(request: V1ChangeableFields): boolean {
  const isValidString = (value: string) => value != null && value.trim() != "";

  let isValid = true;
  const markAsInvalid = isMarkAsInvalidRequiredProperties.value;
  markAsInvalid.Title = !isValidString(request.Title);
  markAsInvalid.Description = !isValidString(request.Description);
  markAsInvalid.Country = request.Country === null || request.Country === Country.Null;
  markAsInvalid.ContentType = request.ContentType === null;
  markAsInvalid.ContentStatus = request.ContentStatus === null;

  if (
    markAsInvalid.Title ||
    markAsInvalid.Description ||
    markAsInvalid.Country ||
    markAsInvalid.ContentType ||
    markAsInvalid.ContentStatus
  ) {
    isValid = false;
  }

  return isValid;
}
</script>

<style lang="scss" scoped>
.content-edit {
  &__header {
    text-align: start;
  }

  &__genres-selected {
    flex-flow: wrap;
  }

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
    padding: 10px 12px;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
    }
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
    margin: 12px;
    gap: 26px;
  }

  &__unit-box {
    display: grid;
    height: fit-content;
    grid-gap: 8px;
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
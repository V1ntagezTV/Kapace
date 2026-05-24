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
      <div class="content-edit__images-box fit-content row gap-16">
        <div v-if="mainImageUrl" class="content-edit__main-image-wrapper">
          <img
            class="content-edit__main-image m-radius-8 m-border"
            :src="mainImageUrl"
            alt="Обложка контента"
            @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
          >
          <BaseImageInput
            class="content-edit__main-image-input m3-bg-2 column h__center"
            @on:update="updateImage"
          />
        </div>
        <BaseImageInput
          v-else
          class="m3-bg-2 column h__center"
          @on:update="updateImage"
        />
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Дополнительные изображения
        </p>
        <label class="body-medium">Можно добавить несколько изображений и удалить ненужные</label>
      </div>
      <div class="column gap-8">
        <input
          ref="additionalImagesInputRef"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          multiple
          style="display: none;"
          @change="onAdditionalImagesSelected"
        >
        <BaseTextButton
          class="material m-radius-circle content-edit__text-button"
          @click="openAdditionalImagesDialog"
        >
          Добавить изображения
        </BaseTextButton>

        <div v-if="additionalImages.length > 0" class="content-edit__additional-images">
          <div
            v-for="image in additionalImages"
            :key="image.LocalId"
            class="content-edit__additional-image"
          >
            <button
              class="content-edit__additional-image-delete material m-radius-circle"
              type="button"
              @click="removeAdditionalImage(image.LocalId)"
            >
              <x-icon />
            </button>
            <img
              :src="image.Url"
              class="m-radius-8 m-border"
              style="height: 160px; width: 110px; object-fit: cover;"
              alt="Дополнительное изображение"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities-column">
        <div class="content-edit__box-activities row gap-16">
          <p class="body-large">
            Название*
          </p>
          <p class="body-large">
            Статус*
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
          Страна*
        </p>
        <label class="body-large">
          Тип дорамы*
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
          Описание*
        </p>
      </div>
      <base-text-area
        v-model="description"
        class="content-edit__description-input body-medium content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
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
        :call-updater-delay="500"
        :is-dropped="isGenresMenuDropped"
        @change:input="onChangeGenreInput"
        @onkeydown:enter="onEnterGenreInput"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities">
        <p class="body-large">
          Длительность эпизода
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
          :input-validator="(input) => input >= 0"
        />
        <BaseInput
          v-model="minAge"
          type="number"
          place-holder="Введите число"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :input-validator="(input) => input >= 0 && input <= 20"
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
import {computed, inject, onMounted, ref} from "vue";
import BaseImageInput from "@/components/Base/BaseImageInput.vue";
import {ImageService} from "@/api/ImageService";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {V1ChangeableFields} from "@/api/Requests/V1CreateContentRequest";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import {GenreService} from "@/api/GenreService";
import {GenreQueryResponseGenre} from "@/api/Responses/GenreQueryResponse";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {ContentService} from "@/api/ContentService";
import {StringExtensions} from "@/helpers/StringExtensions";
import {userStore} from "@/store/UserStore";
import {resolveBackendImageLink } from "@/helpers/ImageLinkResolver";

const props = defineProps<{
  contentId: string | null
}>();

const showEngTitleInputField = ref<boolean>(false);
const showOriginTitleInputField = ref<boolean>(false);

const contentService = inject<ContentService>('content-service');
const imageService = inject<ImageService>('image-service');
const changesHistoryService = inject<ChangesHistoryService>('changes-history-service');
const genreService = inject<GenreService>('genre-service');
const currentUserStore = userStore();
const clientEventStore = ClientEventStore();

let currentImage: File | undefined;
let currentImageUrl = ref<string | null>(null);

type AdditionalImage = {
  LocalId: number;
  Url: string;
  File: File | null;
  IsUploaded: boolean;
};

const additionalImagesInputRef = ref<HTMLInputElement | null>(null);
const additionalImages = ref<AdditionalImage[]>([]);

const imageUrl = ref<string | null>(null);
const mainImageUrl = computed(() => currentImageUrl.value ?? imageUrl.value);
const title = ref<string | null>(null);
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
  const existingContentId = getExistingContentId();
  if (existingContentId !== null) {
    const content = await contentService.V1GetById(existingContentId);
    const contentAvatarLink = resolveBackendImageLink(content.Content.AvatarImageLink);
    imageUrl.value = contentAvatarLink;
    title.value = content.Content.Title;
    contentType.value = content.Content.Type;
    contentStatus.value = content.Content.Status;
    genres.value = content.Genres.map(x => x.Name);
    additionalImages.value = (content.Content.Images ?? [])
      .map(link => resolveBackendImageLink(link))
      .filter(link => !!link && link !== contentAvatarLink)
      .map(link => ({
        LocalId: generateLocalId(),
        Url: link,
        File: null,
        IsUploaded: true
      }));
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

const genreInput = ref<string>('');
const genresQuery = ref<GenreQueryResponseGenre[]>([]);
const genreSelectableValues = computed(() => genresQuery.value.map(g => g.Name));
const isGenresMenuDropped = ref(false);
const maxGenresCount = 20;
const maxGenreLength = 64;

async function onChangeGenreInput(input: string, isSelected: boolean) {
  if (!isSelected) {
    if (StringExtensions.isNullOrEmpty(input)) {
      isGenresMenuDropped.value = false;
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
    if (genresQuery.value.length > 0) {
      isGenresMenuDropped.value = true;
    }
  } else {
    addGenre(input);

    genreInput.value = '';
    genresQuery.value = [];
    isGenresMenuDropped.value = false;
  }
}

function onEnterGenreInput(input: string) {
  addGenre(input);
  genreInput.value = '';
  genresQuery.value = [];
  isGenresMenuDropped.value = false;
}

function deleteSelectedGenre(genreName: string) {
  genres.value = genres.value.filter(genre => genre !== genreName);
}

function normalizeGenre(genreName: string): string {
  const trimmedName = genreName
    .trim()
    .split(/\s+/)
    .join(' ');

  if (!trimmedName) {
    return '';
  }

  const lowerValue = trimmedName.toLowerCase();
  return lowerValue.charAt(0).toUpperCase() + lowerValue.slice(1);
}

function addGenre(genreName: string) {
  const normalizedGenre = normalizeGenre(genreName);
  if (!normalizedGenre) {
    return;
  }

  if (normalizedGenre.length > maxGenreLength) {
    clientEventStore.push(`Жанр не может быть длиннее ${maxGenreLength} символов.`, EventTypes.Error);
    return;
  }

  if (genres.value.length >= maxGenresCount) {
    clientEventStore.push(`Можно добавить не более ${maxGenresCount} жанров.`, EventTypes.Error);
    return;
  }

  const isAlreadySelected = genres.value
    .some(selectedGenre => selectedGenre.toLowerCase() === normalizedGenre.toLowerCase());
  if (!isAlreadySelected) {
    genres.value.push(normalizedGenre);
  }
}

const durationInMinutes = (duration: string): number | null => {
  if (!duration) {
    return null;
  }

  const values = duration.split(':');
  const hours: number = parseInt(values[0]);
  const minutes: number = parseInt(values[1]);

  return (hours * 60) + minutes;
};

function getRandomBigInt() {
  const maxPostgresBigInt = BigInt("9223372036854775807");
  const randomValues = crypto.getRandomValues(new Uint32Array(2));

  const firstPart = BigInt(randomValues[0]);
  const secondPart = BigInt(randomValues[1]) & BigInt("2147483647");
  const candidate = (firstPart << BigInt(31)) | secondPart;

  // ID не должен быть 0 и должен попадать в диапазон signed BIGINT.
  return (candidate % maxPostgresBigInt) + BigInt(1);
}
let randomBigInt = getRandomBigInt();

async function onClickInsertContent() {
  randomBigInt = getRandomBigInt();
  const normalizedGenres = genres.value
    .map(normalizeGenre)
    .filter((genreName, index, allGenres) =>
      genreName.length > 0 &&
      genreName.length <= maxGenreLength &&
      allGenres.findIndex(genre => genre.toLowerCase() === genreName.toLowerCase()) === index)
    .slice(0, maxGenresCount);
  genres.value = normalizedGenres;

  const request: V1ChangeableFields = {
    PortraitImageName: null,
    AdditionalImageNames: [],
    Channel: channel.value,
    ContentStatus: contentStatus.value,
    ContentType: contentType.value,
    Country: country.value,
    Description: description.value,
    Duration:  durationInMinutes(duration.value),
    EngTitle: engTitle.value,
    Genres: normalizedGenres,
    MinAge: minAge.value,
    OriginalTitle: originalTitle.value,
    PlannedSeries: plannedSeries.value,
    ReleasedAt: releasedAt.value,
    Title: title.value
  }

  if (!IsAllRequiredPropertiesValid(request)) {
    clientEventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error)
    return;
  }

  try {
    const existingContentId = getExistingContentId();
    const hasExistingContentId = existingContentId !== null;
    const generatedId = hasExistingContentId ? null : randomBigInt;
    const contentOrFakeId = hasExistingContentId ? existingContentId : generatedId;

    if (contentOrFakeId === null || contentOrFakeId === undefined || contentOrFakeId <= 0n) {
      clientEventStore.push('Ошибка! Не удалось получить идентификатор контента.', EventTypes.Error);
      return;
    }

    if (currentImage != null) {
      const image = await imageService.insertImage(contentOrFakeId, currentImage);
      request.PortraitImageName = image.ImageName;
    }

    const pendingUploads = additionalImages.value.filter(image => !image.IsUploaded && image.File != null);
    for (const image of pendingUploads) {
      const imageData = await imageService.insertImage(contentOrFakeId, image.File as File);
      request.AdditionalImageNames.push(imageData.ImageName);
    }

    await changesHistoryService.createContentChange({
      ChangeableFields: request,
      GeneratedId: generatedId,
      ContentId: hasExistingContentId ? existingContentId : 0n,
      CreatedBy: currentUserStore.loggedIn ? currentUserStore.userId : 0
    });

    clientEventStore.push('Успех! Заявка на добавление изменений создано.', EventTypes.Success)
  } catch (exception) {
    clientEventStore.push('Ошибка! Неизвестная ошибка сервера.', EventTypes.Error);
    console.log("exception: " + exception);
  }
}

function getExistingContentId(): bigint | null {
  if (!props.contentId) {
    return null;
  }

  try {
    const parsedId = BigInt(props.contentId);
    return parsedId > 0n ? parsedId : null;
  } catch {
    return null;
  }
}

async function updateImage(image: File, imageUrl: string) {
  currentImage = image;
  currentImageUrl.value = imageUrl;
}

function openAdditionalImagesDialog() {
  additionalImagesInputRef.value?.click();
}

function onAdditionalImagesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }

  for (const file of Array.from(input.files)) {
    const localImageUrl = URL.createObjectURL(file);
    additionalImages.value.push({
      LocalId: generateLocalId(),
      Url: localImageUrl,
      File: file as File,
      IsUploaded: false
    });
  }

  input.value = '';
}

let localImageIdSequence = 0;
function generateLocalId(): number {
  return ++localImageIdSequence;
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
  &__images-box {
    display: flex;
    width: 100%;
    height: 300px;
    overflow: scroll;
    scrollbar-width: none;
  }

  &__main-image-wrapper {
    position: relative;
    width: fit-content;
    height: fit-content;
  }

  &__main-image {
    height: 300px;
    width: auto;
    object-fit: cover;
    display: block;
  }

  &__main-image-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    color: #fff;
  }

  &__main-image-wrapper:hover .content-edit__main-image-input {
    opacity: 1;
    visibility: visible;
  }

  &__main-image-input:deep(.image-input__box) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    background-image: none;
    color: #fff;
    font-weight: 600;
    gap: 8px;
  }

  &__main-image-input:deep(svg) {
    filter: brightness(0) invert(1);
  }

  &__header {
    text-align: start;
  }

  &__genres-selected {
    flex-flow: wrap;
  }

  &__additional-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__additional-image {
    position: relative;
    display: flex;
    width: 110px;

    &:hover .content-edit__additional-image-delete {
      background: color-mix(in srgb, var(--primary40) 92%, white 8%);
    }
  }

  &__additional-image-delete {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 1;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    background: var(--primary40);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transition: background-color 0.15s ease, transform 0.15s ease;
    cursor: pointer;

    &:hover {
      background: color-mix(in srgb, var(--primary40) 92%, white 8%);
      transform: scale(1.03);
    }
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
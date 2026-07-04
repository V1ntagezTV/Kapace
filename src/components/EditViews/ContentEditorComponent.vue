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
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import BaseImageInput from "@/components/Base/BaseImageInput.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import { useContentEditor } from "@/composables/edits/useContentEditor";
import { toRef } from "vue";

const props = defineProps<{
  contentId: string | null
}>();

const {
  ContentStatus,
  ContentType,
  Country,
  showEngTitleInputField,
  showOriginTitleInputField,
  additionalImagesInputRef,
  additionalImages,
  mainImageUrl,
  title,
  engTitle,
  originalTitle,
  description,
  country,
  contentType,
  contentStatus,
  genres,
  duration,
  releasedAt,
  plannedSeries,
  minAge,
  isMarkAsInvalidRequiredProperties,
  genreInput,
  genreSelectableValues,
  isGenresMenuDropped,
  onChangeGenreInput,
  onEnterGenreInput,
  deleteSelectedGenre,
  removeAdditionalImage,
  onClickInsertContent,
  updateImage,
  openAdditionalImagesDialog,
  onAdditionalImagesSelected,
} = useContentEditor(toRef(props, 'contentId'));
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
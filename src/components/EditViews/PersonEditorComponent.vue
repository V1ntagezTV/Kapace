<template>
  <div class="content-edit__right-box m-radius-16">
    <h3 class="title-large content-edit__header">
      {{ pageTitle }}
    </h3>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Фото*
        </p>
        <label class="body-medium">Основное фото персоны</label>
      </div>
      <div class="content-edit__images-box fit-content row gap-16">
        <div v-if="mainImageUrl" class="content-edit__main-image-wrapper">
          <img
            class="content-edit__main-image m-radius-8 m-border"
            :src="mainImageUrl"
            alt="Фото персоны"
            @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
          >
          <BaseImageInput
            class="content-edit__main-image-input m3-bg-2 column h__center"
            @on:update="openImageCropper"
          />
        </div>
        <BaseImageInput
          v-else
          class="m3-bg-2 column h__center"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Image"
          @on:update="openImageCropper"
        />
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Дополнительные фото
        </p>
        <label class="body-medium">Можно добавить несколько изображений</label>
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
              alt="Дополнительное фото"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Имя*
        </p>
      </div>
      <BaseInput
        v-model="name"
        class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Name"
        :place-holder="'Введите имя персоны*'"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Описание*
        </p>
      </div>
      <MarkdownEditor
        v-model="description"
        class="content-edit__description-input"
        :placeholder="'Введите описание персоны'"
        :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Description"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__box-activities">
        <p class="body-large">
          Гендер
        </p>
        <p class="body-large">
          День рождения
        </p>
      </div>
      <div class="content-edit__box-activities">
        <BaseSelector
          :model-value="selectedGenderLabel"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :title="'Не указан'"
          :selectable-values="genderSelectableValues"
          @update:model-value="onGenderLabelSelected"
        />
        <BaseInput
          v-model="birthDate"
          type="date"
          class="content-edit__bg m-radius-1 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isBirthDateInvalid"
        />
      </div>
    </div>

    <div class="content-edit__buttons-box">
      <base-button
        class="material m-radius-circle"
        :variant="'filled'"
        @click="onClickInsertPerson"
      >
        Отправить
      </base-button>
      <base-button
        :variant="'outline'"
        class="material m-border m-radius-circle"
        @click="resetForm"
      >
        Сбросить
      </base-button>
    </div>

    <ImageCropModal
      :is-visible="isImageCropperVisible"
      :image="imageToCrop"
      :image-url="imageToCropUrl"
      @close="closeImageCropper"
      @crop="applyCroppedImage"
    />
  </div>
</template>

<script setup lang="ts">
import BaseInput from '@/components/Base/BaseInput.vue';
import BaseButton from '@/components/Base/BaseButton.vue';
import BaseSelector from '@/components/Base/Selector/BaseSelector.vue';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor.vue';
import BaseTextButton from '@/components/Base/BaseTextButton.vue';
import BaseImageInput from '@/components/Base/BaseImageInput.vue';
import XIcon from '@/components/Icons/xIcon.vue';
import ImageCropModal from '@/components/Modal/ImageCropModal.vue';
import { usePersonEditor } from '@/composables/edits/usePersonEditor';
import { onUnmounted, ref, toRef } from 'vue';

const props = defineProps<{
  personId: string | null;
  pageTitle: string;
}>();

const {
  additionalImagesInputRef,
  additionalImages,
  mainImageUrl,
  name,
  description,
  birthDate,
  isBirthDateInvalid,
  genderSelectableValues,
  selectedGenderLabel,
  onGenderLabelSelected,
  isMarkAsInvalidRequiredProperties,
  removeAdditionalImage,
  onClickInsertPerson,
  resetForm,
  updateImage,
  openAdditionalImagesDialog,
  onAdditionalImagesSelected,
} = usePersonEditor(toRef(props, 'personId'));

const isImageCropperVisible = ref(false);
const imageToCrop = ref<File | null>(null);
const imageToCropUrl = ref('');

function openImageCropper(image: File, imageUrl: string) {
  closeImageCropper();
  imageToCrop.value = image;
  imageToCropUrl.value = imageUrl;
  isImageCropperVisible.value = true;
}

function closeImageCropper() {
  isImageCropperVisible.value = false;
  imageToCrop.value = null;
  if (imageToCropUrl.value) {
    URL.revokeObjectURL(imageToCropUrl.value);
    imageToCropUrl.value = '';
  }
}

function applyCroppedImage(image: File) {
  updateImage(image, URL.createObjectURL(image));
  closeImageCropper();
}

onUnmounted(closeImageCropper);
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

  &__box-activities {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 8px;
    column-gap: 16px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
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

  &__text-button {
    width: fit-content;
    color: var(--primary40);
    padding: 10px 12px;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
    }
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

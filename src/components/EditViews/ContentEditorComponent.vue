<template>
  <div class="content-edit__right-box">
    <h3 class="edit__page-header">
      Основная информация
    </h3>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Изображение
        </p>
        <label class="body-medium">Выберите изображение для профиля содержимого</label>
      </div>
      <BaseImageInput @on:update="updateImage" />
    </div>

    <div class="content-edit__unit-box">
      <div class="material content-edit__details">
        <p class="body-large">
          Название
        </p>
        <label class="body-medium">
          * Русское название - обязательное<br>
          * Не стесняйтесь пользоваться переводчиком
        </label>
      </div>
      <div class="content-edit__box-activities-column">
        <BaseInput
          v-model="changeableFields.Title"
          class="content-edit__bg m3-bg-1 m-radius-1"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Title"
          :place-holder="'Введите русское название *'"
        />
        <BaseInput
          v-show="!showEngTitleInputField"
          v-model="changeableFields.EngTitle"
          class="content-edit__bg m3-bg-1 m-radius-1"
          :place-holder="'Введите английское название'"
        />
        <BaseInput
          v-show="!showOriginTitleInputValue"
          v-model="changeableFields.OriginalTitle"
          class="content-edit__bg m3-bg-1 m-radius-1"
          :place-holder="'Введите оригинальное название'"
        />

        <div class="content-edit__buttons-rowed">
          <BaseTextButton
            v-show="showEngTitleInputField"
            class="material m-radius-circle content-edit__text-button"
            @click="showEngTitleInput"
          >
            Добавить английское название
          </BaseTextButton>
          <BaseTextButton
            v-show="showOriginTitleInputValue"
            class="material m-radius-circle content-edit__text-button"
            @click="showOriginTitleInput"
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
          v-model="changeableFields.Country"
          class="content-edit__bg m-radius-1"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Country"
          :title="'Выберите страну'"
          :selectable-values="[Country.Japan, Country.China, Country.Korea]"
        />
        <BaseSelector
          v-model="changeableFields.ContentType"
          class="content-edit__bg m-radius-1"
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
        v-model="changeableFields.Description"
        class="content-edit__description-input content-edit__bg m-radius-1"
        :placeholder="'Введите описание'"
        :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Description"
      />
    </div>

    <h3>Вторичная информация</h3>

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
          v-model="changeableFields.Duration"
          class="content-edit__bg m-radius-1"
        />
        <YearPicker
          v-model="changeableFields.ReleasedAt"
          class="content-edit__bg m-radius-1"
        />
      </div>
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Планируемое количество серий
        </p>
      </div>
      <BaseInput
        v-model="changeableFields.PlannedSeries"
        type="number"
        place-holder="Введите число"
        class="content-edit__bg m3-bg-1 m-radius-1"
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
      <BaseInput
        :place-holder="'Введите жанры'"
        class="content-edit__bg m3-bg-1 m-radius-1"
      />
    </div>

    <div class="content-edit__unit-box">
      <div class="content-edit__details">
        <p class="body-large">
          Возрастное ограничение
        </p>
        <label class="body-medium">
          Минимально разрешённый возраст
        </label>
      </div>
      <BaseInput
        v-model="changeableFields.MinAge"
        type="number"
        place-holder="Введите число"
        class="content-edit__bg m3-bg-1 m-radius-1"
      />
    </div>

    <div class="content-edit__buttons-box">
      <base-button
        class="m-radius-circle"
        :variant="'filled'"
        @click="onClickInsertContent(changeableFields)"
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
import TimePicker from "@/components/Base/TimePicker.vue";
import YearPicker from "@/components/Base/DatePicker.vue";
import BaseTextArea from "@/components/Base/BaseTextArea.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {Country} from "@/api/Enums/Country";
import {ContentType} from "@/api/Enums/ContentType";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import {inject, ref} from "vue";
import BaseImageInput from "@/components/Base/BaseImageInput.vue";
import {ImageService} from "@/api/ImageService";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {Linter} from "eslint";
import FlatConfigFileSpec = Linter.FlatConfigFileSpec;
import {V1ChangeableFields} from "@/api/Requests/V1CreateContentRequest";
import '@material/web/button/filled-button.js';


let showEngTitleInputField = ref(true);
let showOriginTitleInputValue = ref(true);

const imageService = inject<ImageService>('image-service');
const changesHistoryService = inject<ChangesHistoryService>('changes-history-service');

let currentImage: FlatConfigFileSpec | FlatConfigFileSpec[];

async function updateImage(image: FlatConfigFileSpec | FlatConfigFileSpec[]) {
  currentImage = image;
}

const changeableFields: V1ChangeableFields = {
  ContentType: null,
  Country: null,
  Description: null,
  Duration: null,
  EngTitle: null,
  MinAge: null,
  OriginalTitle: null,
  PlannedSeries: null,
  ReleasedAt: null,
  Title: null
}

const isMarkAsInvalidRequiredProperties = ref({
  Title: false,
  Description: false,
  Country: false,
  ContentType: false,
});

async function onClickInsertContent(request: V1ChangeableFields) {
  if (!IsAllRequiredPropertiesValid(request)) {
    console.log('some properties is not valid!')
    return;
  }

  const response = await changesHistoryService.createContentChange({
    ChangeableFields: request,
    ContentId: 0,
    CreatedBy: 0
  });

  if (currentImage != null) {
    await imageService.insertImage(null, response.HistoryId, currentImage);
  }
}

function IsAllRequiredPropertiesValid(request: V1ChangeableFields): boolean {
  const isValidString = (value: string) => value != null && value.trim() != "";

  let isValid = true;
  const markAsInvalid = isMarkAsInvalidRequiredProperties.value;
  markAsInvalid.Title = !isValidString(request.Title);
  markAsInvalid.Description = !isValidString(request.Description);
  markAsInvalid.Country = request.Country === null || request.Country === Country.Null;
  markAsInvalid.ContentType = request.ContentType === null;

  if (
    markAsInvalid.Title ||
    markAsInvalid.Description ||
    markAsInvalid.Country ||
    markAsInvalid.ContentType
  ) {
    //TODO: надо добавить popup о том что криво заполнены поля
    isValid = false;
  }

  return isValid;
}

function showEngTitleInput() { showEngTitleInputField.value = !showEngTitleInputField.value; }
function showOriginTitleInput() { showOriginTitleInputValue.value = !showOriginTitleInputValue.value}
</script>

<style lang="scss" scoped>
.content-edit {
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
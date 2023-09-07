<template>
  <div class="edit__right-box">
    <h3 class="edit__page-header">
      Основная информация
    </h3>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Изображение</h4>
        <label>Выберите изображение для профиля содержимого</label>
      </div>
      <BaseImageInput @on:update="updateImage" />
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Название</h4>
        <label>Название обязательно должно быть на русском</label>
      </div>
      <div class="edit__box-activities-column">
        <BaseInput
          v-model="changeableFields.Title"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Title"
          :place-holder="'Введите название'"
          :label="'ru-Название'"
        />
        <BaseTextButton
          v-show="showEngTitleInputField"
          class="edit__text-button"
          @click="showEngTitleInput"
        >
          Добавить en-название
        </BaseTextButton>
        <BaseInput
          v-show="!showEngTitleInputField"
          v-model="changeableFields.EngTitle"
          :place-holder="'Введите название'"
          :label="'en-Название'"
        />

        <BaseTextButton
          v-show="showOriginTitleInputValue"
          class="edit__text-button"
          @click="showOriginTitleInput"
        >
          Добавить оригинальное название
        </BaseTextButton>
        <BaseInput
          v-show="!showOriginTitleInputValue"
          v-model="changeableFields.OriginalTitle"
          :place-holder="'Введите название'"
          :label="'org-Название'"
        />
      </div>
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Страна / Тип дорамы</h4>
      </div>
      <div class="edit__box-activities">
        <BaseSelector
          v-model="changeableFields.Country"
          class="edit__selector"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Country"
          :title="'Выберите страну'"
          :selectable-values="[Country.Japan, Country.China, Country.Korea]"
          :label="'Страна'"
        />
        <BaseSelector
          v-model="changeableFields.ContentType"
          class="edit__selector"
          :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.ContentType"
          :title="'Выберите тип'"
          :selectable-values="[ContentType.Serial, ContentType.Film, ContentType.Show, ContentType.Documentary]"
          :label="'Тип'"
        />
      </div>
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Описание</h4>
        <label>Постарайтесь уместиться в 300 символов</label>
      </div>
      <BaseTextArea
        v-model="changeableFields.Description"
        class="edit__description-input"
        :label="'Описание'"
        :mark-as-invalid-input="isMarkAsInvalidRequiredProperties.Description"
      />
    </div>

    <h3>Вторичная информация</h3>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Длительность / Дата релиза</h4>
        <label>Можно указать год или полную дату релиза.</label>
      </div>
      <div class="edit__box-activities">
        <TimePicker
          v-model="changeableFields.Duration"
          label="Длительность"
        />
        <YearPicker
          v-model="changeableFields.ReleasedAt"
          label="Дата релиза"
        />
      </div>
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Планируемое количество серий</h4>
      </div>
      <BaseInput
        v-model="changeableFields.PlannedSeries"
        type="number"
        label="Количество серий"
        place-holder="Введите число"
      />
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Жанры</h4>
        <label>Подсказка: детектив, драма, триллер</label>
      </div>
      <BaseInput
        :place-holder="'Введите имя жанра'"
        :label="'Жанр'"
      />
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Возрастное ограничение</h4>
        <label>Нужно ввести минимально разрешённый возраст</label>
      </div>
      <BaseInput
        v-model="changeableFields.MinAge"
        type="number"
        label="Возраст"
        place-holder="Введите число"
      />
    </div>

    <div class="edit__buttons-box">
      <base-button
        :button-type="2"
        @click="onClickInsertContent(changeableFields)"
      >
        Отправить
      </base-button>
      <base-button>
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
import BaseSelector from "@/components/Base/BaseSelector.vue";
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
import moment from "moment/moment";

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
.edit {
  &__page-header {
    color: var(--dark-primary);
  }

  &__buttons-box {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: min-content;
    grid-auto-flow: column;
    grid-gap: 20px;
    justify-content: end;

    & button {
      width: fit-content;
      padding-left: 26px;
      padding-right: 26px;
    }
  }

  &__selector {
    width: 100%;
  }

  &__box-activities {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
  }

  &__box-activities-column {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content(100%);
    grid-gap: 20px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
  }

  &__text-button {
    color: #6686B3;
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
    margin-top: 20px;
    margin-bottom: 20px;
  }

  &__right-box {
    display: grid;
    grid-template-rows: min-content;
    grid-auto-rows: min-content;
    gap: 20px;
    padding: 0 26px 26px 20px;
  }

  &__unit-box {
    display: grid;
    height: fit-content;
    grid-template-columns: repeat(2, 2fr);
    grid-column: 1;
    grid-gap: 10px;
    column-gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--font-gray-v1);;
  }

  &__details {
    display: grid;
    justify-items: start;
    grid-auto-rows: min-content;
    gap: 6px;

    & * {
      padding: 0;
      margin: 0;
    }

    & h4 {
      color: var(--dark-primary);
      height: fit-content;
    }

    & label {
      color: var(--dark-primary);
      height: fit-content;
      text-align: start;
    }
  }

  &__description-input {
    resize: vertical;
    width: 100%;
  }
}

</style>
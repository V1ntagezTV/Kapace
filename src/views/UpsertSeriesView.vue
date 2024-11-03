<template>
  <div class="edit__box">
    <BaseBackground class="edit__right-box" :type="2">
      <h3>Основная информация</h3>
      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Название</h4>
          <label>Название обязательно должно быть на русском</label>
          <BaseTextButton class="edit__text-button">
            Добавить перевод названия
          </BaseTextButton>
        </div>
        <BaseInput
          :place-holder="'Введите название'"
          :label="'ru-Название'"
        />
      </div>

      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Страна / Дата релиза</h4>
          <label>Дату полностью указывать не обязательно, достаточно указать год</label>
        </div>
        <div class="edit__box-activities">
          <BaseSelector
            class="edit__selector"
            :title="'Выберите страну'"
            :selectable-values="[Country.Japan, Country.China, Country.Korea]"
            :label="'Страна'"
          />
          <BaseSelector
            class="edit__selector"
            :title="'Выберите тип'"
            :selectable-values="[ContentType.Serial, ContentType.Film, ContentType.Show, ContentType.Documentary]"
            :label="'Тип'"
          />
        </div>
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
          <h4>Описание</h4>
          <label>Постарайтесь уместиться в 300 символов</label>
        </div>
        <BaseTextArea
          class="edit__description-input"
          :label="'Описание'"
        />
      </div>

      <h3>Вторичная информация</h3>

      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Длительность / Дата релиза</h4>
          <label>Можно указать год или полную дату релиза.</label>
        </div>
        <div class="edit__box-activities">
          <TimePicker label="Длительность" />
          <YearPicker label="Дата релиза" />
        </div>
      </div>

      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Планируемое количество серий</h4>
        </div>
        <BaseInput
          type="number"
          label="Количество серий"
          place-holder="Введите число"
        />
      </div>

      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Возрастное ограничение</h4>
          <label>Нужно ввести минимально разрешённый возраст</label>
        </div>
        <BaseInput
          type="number"
          label="Возраст"
          place-holder="Введите число"
        />
      </div>

      <div class="edit__buttons-box">
        <base-button :button-type="2">
          Отправить
        </base-button>
        <base-button>
          Сбросить
        </base-button>
      </div>
    </BaseBackground>
  </div>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import BaseTextArea from "@/components/Base/BaseTextArea.vue";
import YearPicker from "@/components/Base/DatePicker.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {Country} from "@/api/Enums/Country";
import BaseButton from "@/components/Base/BaseButton.vue";
import TimePicker from "@/components/Base/TimePicker.vue";
import {ContentType} from "@/api/Enums/ContentType";

class CreateContentViewModel {
  Title: string
  Country: typeof Country
  Type: typeof ContentType
  Genres: string
  Description: string
  Duration: number
  ReleasedAt: number
  PlannedSeries: number
  AgeLimit: number
}

const viewModel = new CreateContentViewModel();
</script>

<style lang="scss" scoped >
.edit {
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

  &__text-button {
    color: #6686B3;
  }

  &__box {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-rows: max-content;
    gap: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
  }
  
  &__right-box {
    display: grid;
    grid-template-rows: min-content;
    grid-auto-rows: min-content;
    gap: 20px;
    padding: 20px;
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
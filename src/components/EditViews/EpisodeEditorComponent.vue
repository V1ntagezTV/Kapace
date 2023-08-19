<template>
  <div class="edit__right-box">
    <h3 class="edit__page-header">
      Основная информация
    </h3>

    <template v-if="isCreateNewEpisode === null">
      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Изображение</h4>
          <label>Выберите изображение для профиля содержимого</label>
        </div>
        <div class="edit__box-activities-column">
          <BaseButton :button-type="2" @click="clickToChooseEpisode">
            Выбрать эпизод
          </BaseButton>
          <BaseButton style="height: min-content;" :button-type="3" @click="clickToChooseCreateEpisode">
            Создать эпизод
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Выбор эпизода -->
    <template v-if="isCreateNewEpisode === false">
      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Изображение</h4>
          <label>Выберите изображение для профиля содержимого</label>
        </div>
        <div class="edit__box-activities">
          <BaseInput :place-holder="'Выберите дораму'" />
          <BaseInput place-holder="Серия" type="number" />
        </div>
      </div>
    </template>

    <!-- Создание эпизода -->
    <template v-if="isCreateNewEpisode === true">
      <div class="edit__unit-box">
        <div class="edit__details">
          <h4>Изображение</h4>
          <label>Выберите изображение для профиля содержимого</label>
        </div>
        <div class="edit__box-activities-column">
          <BaseInput :place-holder="'Выберите дораму'" />
          <BaseImageInput />
          <BaseInput place-holder="Выберите эпизод" type="number" />
        </div>
      </div>
    </template>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Номер серии / Язык перевода</h4>
        <label>???</label>
      </div>
      <div class="edit__box-activities">
        <BaseSelector
          class="edit__selector"
          :title="'Тип перевода'"
          :selectable-values="['Озвучка', 'Субтитры', 'Auto-сабы']"
          :label="'Тип перевода'"
        />
        <BaseSelector
          class="edit__selector"
          :title="'Выберите язык'"
          :selectable-values="[Country.Japan, Country.China, Country.Korea]"
          :label="'Язык'"
        />
      </div>
    </div>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Ссылка/Скрипт видео</h4>
        <label>???</label>
      </div>
      <div class="edit__box-activities-column">
        <BaseTextArea
          class="edit__description-input"
          :label="'Видео'"
        />
      </div>
    </div>

    <h3>Вторичная информация</h3>

    <div class="edit__unit-box">
      <div class="edit__details">
        <h4>Качество видео / Язык перевода</h4>
        <label>???</label>
      </div>
      <BaseSelector
        class="edit__selector"
        :title="'Выберите качество'"
        :selectable-values="['720p', '1080p', '2K', '4K']"
        :label="''"
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
  </div>
</template>

<script setup lang="ts">
import BaseInput from "@/components/Base/BaseInput.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseTextArea from "@/components/Base/BaseTextArea.vue";
import BaseSelector from "@/components/Base/BaseSelector.vue";
import BaseImageInput from "@/components/Base/BaseImageInput.vue";
import {Country} from "@/api/Enums/Country";
import {ref} from "vue";

const isCreateNewEpisode = ref<boolean | null>(null);

function clickToChooseCreateEpisode() {
  isCreateNewEpisode.value = true
}

function clickToChooseEpisode() {
  isCreateNewEpisode.value = false;
}
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
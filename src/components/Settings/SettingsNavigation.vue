<template>
  <div class="settings-nav__container">
    <h3>
      <!-- TODO: Вместо надписи навигация должна быть ссылка на профиль с круглой аватаркой и никнеймом -->
      Навигация
    </h3>
    <div class="settings-nav__vertical-splitter" />
    <div>
      <div class="settings-nav__category-box">
        <label class="settings-nav__label">Создание</label>
        <div class="settings-nav__category">
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.Creates)">
            Мой список
          </div>
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.CreateContent)">
            Дорамы
          </div>
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.CreateEpisode)">
            Серия
          </div>
        </div>
      </div>
      <div class="settings-nav__vertical-splitter" />
      <div class="settings-nav__category-box">
        <label class="settings-nav__label">Редактирование</label>
        <div class="settings-nav__category">
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.Edits)">
            Мой список
          </div>
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.EditContent)">
            Дорамы
          </div>
          <div class="settings-nav__category-button" @click="updateSelectedPage(SettingsPageTypes.EditEpisode)">
            Серия
          </div>
        </div>
      </div>
    </div>
    <div class="settings-nav__vertical-splitter" />
  </div>
</template>

<script setup lang="ts">
import {defineEmits} from "vue";
import {SettingsPageTypes} from "@/models/SettingsPageTypes";

const emits = defineEmits<{
  (emitName: 'update:selected-page', selectedPage: SettingsPageTypes) : void
}>()

function updateSelectedPage(page: SettingsPageTypes) {
  emits("update:selected-page", page);
}
</script>

<style scoped lang="scss">
.settings-nav {
  &__container {
    display: grid;
    grid-template-rows: min-content;
    height: fit-content;
  }

  &__vertical-splitter {
    width: 100%;
    height: 1px;
    background: var(--font-gray-v2);
  }

  &__label {
    display: grid;
    grid-auto-rows: min-content;
    height: fit-content;

    font-size: 12px;
    color: var(--font-gray-v4);
    text-align: start;
    padding: 10px 20px;
  }

  &__category {
    display: grid;
    grid-template-rows: auto;
    height: fit-content;
    align-items: stretch;
    text-align: start;
  }

  &__category-button {
    padding-left: 30px;
    padding-top: 10px;
    padding-bottom: 10px;

    color: var(--dark-primary);
    font-weight: 600;

    &:hover {
      cursor: pointer;
      color: var(--primary);
      background: var(--font-gray-v2);
    }
  }

  &__category-box {
    display: grid;
    padding-bottom: 10px;
  }
}
</style>
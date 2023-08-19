<template>
  <BaseBackground class="edit__box">
    <SettingsNavigation @update:selectedPage="updateSelectedPage" />
    <div class="edit__splitter" />
    <ContentEditorComponent v-if="selectedPage === SettingsPageTypes.CreateContent" />
    <EpisodeEditorComponent v-if="selectedPage === SettingsPageTypes.CreateEpisode" />
  </BaseBackground>
</template>

<script lang="ts" setup>
import {ref} from "vue";

import BaseBackground from "@/components/Base/BaseBackground.vue";
import SettingsNavigation from "@/components/Settings/SettingsNavigation.vue";
import ContentEditorComponent from "@/components/EditViews/ContentEditorComponent.vue";
import {SettingsPageTypes} from "@/models/SettingsPageTypes";
import EpisodeEditorComponent from "@/components/EditViews/EpisodeEditorComponent.vue";

const selectedPage = ref(SettingsPageTypes.CreateContent);
function updateSelectedPage(selectedComponent: SettingsPageTypes) {
  console.log(selectedComponent);
  selectedPage.value = selectedComponent;
}
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
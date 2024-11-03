<template>
  <div class="edit__box">
    <SettingsNavigation :current="selectedPage" />
    <EditListComponent v-if="selectedPage === SettingsPageTypes.Edits" />
    <ContentEditorComponent
      v-if="selectedPage === SettingsPageTypes.CreateContent"
      :content-id="contentId"
    />
    <EpisodeEditorComponent
      v-if="selectedPage === SettingsPageTypes.CreateEpisode"
      :content-id="contentId"
      :episode-id="episodeId"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";
import SettingsNavigation from "@/components/Settings/SettingsNavigation.vue";
import ContentEditorComponent from "@/components/EditViews/ContentEditorComponent.vue";
import {SettingsPageTypes} from "@/models/SettingsPageTypes";
import EpisodeEditorComponent from "@/components/EditViews/EpisodeEditorComponent.vue";
import EditListComponent from "@/components/EditViews/EditListComponent.vue";
import {useRoute} from "vue-router";

const route = useRoute();

const contentId = ref<number | null>(null);
const episodeId = ref<number | null>(null);
contentId.value = +route.params.content;
episodeId.value = +route.params.episode;
const selectedPage = ref<typeof SettingsPageTypes>(choosePage());

watch(() => route.fullPath, () => {
  selectedPage.value = choosePage();
});

function choosePage() : SettingsPageTypes {
  if (route.fullPath.includes("content")) {
    return SettingsPageTypes.CreateContent;
  } else if (route.fullPath.includes("episode")) {
    return SettingsPageTypes.CreateEpisode;
  } else if (route.fullPath.includes("list")){
    return SettingsPageTypes.Edits;
  } else {
    return SettingsPageTypes.Edits;
  }
}
</script>

<style lang="scss" scoped>
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
    grid-template-columns: 275px 1fr;
    grid-template-rows: max-content;
    height: fit-content;
    background: var(--surface-container-lowest100);
    padding-left: 12px;
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
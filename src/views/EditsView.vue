<template>
  <div class="edit__box">
    <SettingsNavigation class="col" :current="selectedPage" />
    <EditListComponent v-if="selectedPage === SettingsPageTypes.Edits" />
    <ContentEditorComponent
      v-if="selectedPage === SettingsPageTypes.CreateContent || selectedPage === SettingsPageTypes.EditContent"
      :content-id="contentId"
    />
    <EpisodeEditorComponent
      v-if="selectedPage === SettingsPageTypes.CreateEpisode || selectedPage === SettingsPageTypes.EditEpisode"
      :content-id="contentId"
      :episode-id="episodeId"
    />
  </div>
</template>

<script lang="ts" setup>
import ContentEditorComponent from '@/components/EditViews/ContentEditorComponent.vue';
import EditListComponent from '@/components/EditViews/EditListComponent.vue';
import EpisodeEditorComponent from '@/components/EditViews/EpisodeEditorComponent.vue';
import SettingsNavigation from '@/components/Settings/SettingsNavigation.vue';
import { useEditNavigation } from '@/composables/edits/useEditNavigation';
import { SettingsPageTypes } from '@/models/SettingsPageTypes';

const { selectedPage, contentId, episodeId } = useEditNavigation();
</script>

<style lang="scss" scoped>
.edit {
  &__box {
    display: flex;
    flex-direction: column;
    height: fit-content;
    gap: 20px;
  }
}
</style>

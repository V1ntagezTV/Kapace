<template>
  <div class="edit__box">
    <SettingsNavigation class="col" :current="selectedPage" />
    <EditListComponent v-if="isListPage" />
    <KeepAlive>
      <ContentEditorComponent
        v-if="isContentEditorPage"
        :key="contentId ?? 'new-content'"
        :content-id="contentId"
        :page-title="contentPageTitle"
      />
      <EpisodeEditorComponent
        v-else-if="isEpisodeEditorPage"
        :key="`${contentId ?? 'new'}-${episodeId ?? 'new'}`"
        :content-id="contentId"
        :episode-id="episodeId"
        :page-title="episodePageTitle"
      />
      <PersonEditorComponent
        v-else-if="isPersonEditorPage"
        :key="personId ?? 'new-person'"
        :person-id="personId"
        :page-title="personPageTitle"
      />
    </KeepAlive>
  </div>
</template>

<script lang="ts" setup>
import ContentEditorComponent from '@/components/EditViews/ContentEditorComponent.vue';
import EditListComponent from '@/components/EditViews/EditListComponent.vue';
import EpisodeEditorComponent from '@/components/EditViews/EpisodeEditorComponent.vue';
import PersonEditorComponent from '@/components/EditViews/PersonEditorComponent.vue';
import SettingsNavigation from '@/components/Settings/SettingsNavigation.vue';
import { useEditsAccess } from '@/composables/edits/useEditsAccess';
import { useEditNavigation } from '@/composables/edits/useEditNavigation';
import { useEditsNavigationGuard } from '@/composables/edits/useEditsNavigationGuard';

useEditsAccess();
useEditsNavigationGuard();

const {
  selectedPage,
  contentId,
  episodeId,
  personId,
  isListPage,
  isContentEditorPage,
  isEpisodeEditorPage,
  isPersonEditorPage,
  contentPageTitle,
  episodePageTitle,
  personPageTitle,
} = useEditNavigation();
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

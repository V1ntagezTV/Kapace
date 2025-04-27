<template>
  <div class="body-main-flex gap-16">
    <template v-if="content != null && content.PageContent !== undefined">
      <ScrollContentComponent
        v-for="(pageTypeKey, index) in getContentKeys(content)"
        :key="index"
        :title="getMainPageTypeTitle(pageTypeKey)"
        :contents="content.PageContent[index].ContentsInfo"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import ScrollContentComponent from "@/components/Body/BodyComponents/ScrollContentComponent.vue";
import {ContentService} from "@/api/ContentService";
import {inject, onMounted, ref} from "vue";
import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";
import {MainPageType} from "@/api/Enums/MainPageType";
import * as events from "events";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";

const eventStore = ClientEventStore();
const contentService: ContentService = inject('content-service');

function getMainPageTypeTitle(pageType: MainPageType) : string {
  switch (pageType) {
    case MainPageType.PopularForTwoWeeks:
      return "Популярное";
    case MainPageType.LastCreated:
      return "Новинки";
    case MainPageType.LastUpdated:
      return "Последние обновления";
  }
}

let content = ref<V1GetMainPageContentResponse>(null);

onMounted(async() => {
  const response =
    (await contentService.V1GetMainPageContentAsync())
    .onException(() => { eventStore.push('Ошибка сервера! Сообщите нам о проблеме или попробуйте вернуться позже.', EventTypes.Error as typeof EventTypes)});

  if (response.data) {
    content.value = response.data;
  }
});

function getContentKeys(content: V1GetMainPageContentResponse): MainPageType[] {
  return content.PageContent.map((x) => x.MainPageType);
}
</script>

<style lang="scss" scoped>
.body-main-flex {
    padding: 16px 0 40px 0;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}
</style>

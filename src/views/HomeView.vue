<template>
  <div class="body-main-flex gap-16">
    <div style="height: 450px; background: var(--primary40);color: white;" class="row m-radius-28 v__center">
      Что сюда расположить?
    </div>

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

const contentService: ContentService = inject('content-service');

// const slide = {image: "/images/film_test.png", title: "Болтун", description: "Таким образом, повышение уровня гражданского сознания требует от нас анализа экономической целесообразности принимаемых решений. Практический опыт показывает, что реализация намеченного плана развития обеспечивает широкому кругу специалистов участие в формировании соответствующих условий активизации! Задача организации, в особенности..."};
// const slides = [slide, slide, slide];

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
    content.value = await contentService.V1GetMainPageContentAsync();
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

<template>
  <div class="body-main-flex">
    <NewContentComponent
      :slides="slides"
      @select="onSelect($event)"
    />
    <template v-if="content != null && content.Contents !== undefined">
      <ScrollContentComponent
        v-for="(pageTypeKey, index) in getContentKeys(content)"
        :key="index"
        :scroll-title="getMainPageTypeTitle(pageTypeKey)"
        :scroll-content="content.Contents[index].Content"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import NewContentComponent from "@/components/Body/BodyComponents/NewContentComponent.vue";
import ScrollContentComponent from "@/components/Body/BodyComponents/ScrollContentComponent.vue";
import {ContentService} from "@/api/ContentService";
import {inject, onMounted, ref} from "vue";
import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";
import {MainPageType} from "@/api/Enums/MainPageType";

const contentService: ContentService = inject('content-service');

const slide = {image: "/images/film_test.png", title: "Болтун", description: "Таким образом, повышение уровня гражданского сознания требует от нас анализа экономической целесообразности принимаемых решений. Практический опыт показывает, что реализация намеченного плана развития обеспечивает широкому кругу специалистов участие в формировании соответствующих условий активизации! Задача организации, в особенности..."};
const slides = [slide, slide, slide];

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
})

function getContentKeys(content: V1GetMainPageContentResponse): MainPageType[] {
  return content.Contents.map((x) => x.MainPageType);
}

function onSelect(value) {
    console.log(value);
}
</script>

<style lang="scss" scoped>
.body-main-flex {
    padding: 20px 0;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>

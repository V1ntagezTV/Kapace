<template>
  <div class="body-main-flex">
    <NewContentComponent
      :slides="slides"
      @select="onSelect($event)"
    />
    <ScrollContentComponent
      v-for="title in scrollContentTitles"
      :key="title"
      :scroll-title="title"
      :scroll-content="scrollContentData"
    />
  </div>
</template>

<script lang="ts" setup>
import NewContentComponent from "@/components/Body/BodyComponents/NewContentComponent.vue";
import ScrollContentComponent from "@/components/Body/BodyComponents/ScrollContentComponent.vue";
import {ContentService} from "@/api/ContentService";
import {inject, onMounted, ref } from "vue";
import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";

const contentService: ContentService = inject('content-service');

const slides = [
    {image: "/images/film_test.png", title: "1", description: "~"},
    {image: "/images/162_o.jpg", title: "2", description: "~"},
    {image: "/images/177_o.jpg", title: "3", description: "~"}
];
const scrollContentTitles = [
    "Популярное",
    "Новинки",
    "Последние обновления",
];

const scrollContentData = [
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 2", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 3", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
    {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
];

let content: V1GetMainPageContentResponse = ref(null);
onMounted(async() => {
    content = await contentService.V1GetMainPageContentAsync();
})

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

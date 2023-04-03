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

<script>
import NewContentComponent from "./BodyComponents/NewContentComponent.vue";
import ScrollContentComponent from "./BodyComponents/ScrollContentComponent.vue";

export default {
    name: 'BaseBody',
    components: {
        NewContentComponent,
        ScrollContentComponent
    },
    data() {
        return {
            slides: [
                {image: "/images/film_test.png", title: "1", description: "~"},
                {image: "/images/162_o.jpg", title: "2", description: "~"},
                {image: "/images/177_o.jpg", title: "3", description: "~"}
            ],
            scrollContentTitles: [
                "Популярное",
                "Новинки",
                "Последние обновления",
            ],
            scrollContentData: [
                {id: 1, title: "Ночь любви c тобой 1", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
                {id: 2, title: "Ночь любви c тобой 2", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
                {id: 3, title: "Ночь любви c тобой 3", rating: 1.2, watched: 12314, seriesCount: 12, seriesCameOut: 8, image: "/images/film_test.png"},
            ]
        }
    },
    methods: {
        onSelect(value) {
            console.log(value);
        }
    }
}

</script>

<style>

.body-main-flex {
    padding: 20px 0;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
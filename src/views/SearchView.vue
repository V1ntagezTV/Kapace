<template>
  <div class="search-page__container">
    <div class="search-page__body">
      <SearchComponent />
      <SearchTags v-if="acceptedFilters.length > 0" :values="acceptedFilters" />
      <SearchContent :items-content="[generateItem(), generateItem(), generateItem()]" />
    </div>

    <div>
      <SearchFilters
        @update:acceptedFilters="EmitAcceptFilters"
        @clean:accepted-filters="EmitCleanFilters"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SearchComponent from '@/components/Body/Search/SearchComponent.vue';
import SearchTags from '@/components/Body/Search/SearchTags.vue';
import SearchContent from '@/components/Body/Search/SearchContent.vue';
import SearchFilters from '@/components/Search/Filter/SearchFilters.vue';
import {ref} from "vue";

let acceptedFilters = ref<string[]>([])

function generateItem() {
  return {
    ruTitle: "Любовь по контракту",
    engTitle: "Night of Lovof Lovof Lovof Love With You",
    year: 2022,
    country: "Китай",
    minAge: 18,
    genres: ["Романтика", "Романти", "Исторический", "Исторический", "Исторический", "Исторический", "Исторический"],
    languages: ['Рус', "Кор", "Англ"]
  }
}

function EmitAcceptFilters(filters: string[]) {
  acceptedFilters.value = filters
}

function EmitCleanFilters() {
  acceptedFilters.value = []
}
</script>

<style lang="scss">

.search-page {
  &__container {
    padding: 20px 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    width: 100%;
  }
}
</style>
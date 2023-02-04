<template>
  <div class="search-page__container">
    <div class="search-page__body">
      <SearchComponent />
      <SearchTags :values="acceptedFilters" />
      <SearchContent :items-content="[generateItem(), generateItem()]" />
    </div>

    <div>
      <SearchFilters
        @update:acceptedFilters="new EmitAcceptFilters($event)"
        @clean:acceptedFilters="new EmitCleanFilters($event)"
      />
    </div>
  </div>
</template>

<script>
import SearchComponent from '@/components/Body/Search/SearchComponent.vue';
import SearchTags from '@/components/Body/Search/SearchTags.vue';
import SearchContent from '@/components/Body/Search/SearchContent.vue';
import SearchFilters from '@/components/Search/Filter/SearchFilters.vue';

export default {
  name: 'SearchView',
  components: {
    SearchComponent,
    SearchTags,
    SearchContent,
    SearchFilters
  },
  data() {
    return {
      acceptedFilters: []
    }
  },
  methods: {
    generateItem() {
      return {
        ruTitle: "Любовь по контракту",
        engTitle: "Night of Lovof Lovof Lovof Love With You",
        year: 2022,
        country: "Китай",
        minAge: 18,
        genres: ["Романтика", "Романти", "Исторический", "Исторический", "Исторический", "Исторический", "Исторический"],
        languages: ['Рус', "Кор", "Англ"]
      }
    },
    EmitAcceptFilters(acceptedFilters) {
      this.acceptedFilters = acceptedFilters
    },
    EmitCleanFilters() {
      this.acceptedFilters = []
    }
  }
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
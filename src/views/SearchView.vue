<template>
  <div class="search-page__container">
    <div v-if="!isDataReady">
    </div>
    <div class="search-page__body">
      <SearchComponent />
      <SearchTags v-if="acceptedFilters.length > 0" :values="acceptedFilters" />
      <SearchContent v-if="isDataReady" :items-content="initPageContent.Content" />
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
import {inject, onMounted, ref} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetByQueryRequest, V1GetByQuerySearchFilters} from "@/api/Requests/V1GetByQueryRequest";
import {V1GetByQueryResponse} from "@/api/Requests/V1GetByQueryResponse";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";

let acceptedFilters = ref<string[]>([])
const contentService: ContentService = inject("content-service");

let initPageContent = ref<V1GetByQueryResponse>(null);
let isDataReady = ref(false)

onMounted(async () => {
  const request = new V1GetByQueryRequest();
  request.Search = '';
  request.SelectedInfo = ContentSelectedInfo.ContentGenres | ContentSelectedInfo.Translations;

  initPageContent.value = await contentService.V1GetByQuery(request);
  isDataReady.value = true;
})

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
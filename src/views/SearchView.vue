<template>
  <div class="search-page__container">
    <div class="search-page__body">
      <SearchComponent
        :input-text="searchInput"
        @change:input-change="EmitInputChange"
        @keyup.enter="PressSearchEnter"
      />
      <SearchTags
        v-if="filtersV2.length > 0"
        :filters="filtersV2"
        :watch-show-filters="watchableShowFilters"
        @delete:filter="EmitDeleteSingleFilter"
      />
      <SearchContent
        v-if="isDataReady && initPageContent.Content.length > 0"
        :items-content="initPageContent.Content"
      />
      <div v-else-if="isDataReady">
        TODO: Empty response
      </div>
    </div>

    <div>
      <SearchFilters
        :filters="filtersV2"
        @accept:filters="EmitAcceptFilters"
        @clean:filters="EmitCleanFilters"
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
import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {Country} from "@/api/Enums/Country";
import {FilterTypes} from "@/components/Search/Models/FilterTypes";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";

const contentService: ContentService = inject("content-service")

const typeFilters = new Map<ContentType, boolean>([
	[ContentType.Serial, false],
	[ContentType.Show, false],
	[ContentType.Film, false],
	[ContentType.Documentary, false]
]);
const statusFilters = new Map<ContentStatus, boolean>([
	[ContentStatus.Released, false],
	[ContentStatus.Ongoing, false],
	[ContentStatus.Finished, false],
]);
const countryFilters = new Map<Country, boolean>([
	[Country.Korea, false],
	[Country.China, false],
	[Country.Japan, false]
]);

const filtersV2 = ref<FilterUnitModel[]>([
	new FilterUnitModel('Тип', FilterTypes.ContentType as typeof FilterTypes, typeFilters),
	new FilterUnitModel('Статус', FilterTypes.ContentStatus as typeof FilterTypes, statusFilters),
	new FilterUnitModel('Страна', FilterTypes.Country as typeof FilterTypes, countryFilters)
]);
const searchInput = ref("");
const initPageContent = ref<V1GetByQueryResponse>(null);
const isDataReady = ref(false);
const watchableShowFilters = ref(false);

onMounted(async () => {
  initPageContent.value = await GetContentAsync();
  isDataReady.value = true;
})

async function GetContentAsync() : Promise<V1GetByQueryResponse> {
	const request = new V1GetByQueryRequest();

	request.SelectedInfo = ContentSelectedInfo.ContentGenres | ContentSelectedInfo.Translations;
	request.Search = searchInput.value;
	request.Filters = new V1GetByQuerySearchFilters();
	request.Filters.ContentStatuses = GetArrayByFilterType<typeof ContentStatus>(FilterTypes.ContentStatus);
	request.Filters.ContentTypes = GetArrayByFilterType<typeof ContentType>(FilterTypes.ContentType);
	request.Filters.Countries = GetArrayByFilterType<typeof Country>(FilterTypes.Country);
	return await contentService.V1GetByQuery(request);
}

function GetArrayByFilterType<T>(filterType: FilterTypes) {
	const response: typeof T[] = []

	for (const filter of filtersV2.value) {
		filter.selectableValues.forEach((value, key) => {
			if (value && filter.type === filterType) {
				console.log(key);
				response.push(key as typeof T);
			}
		})
	}

	return response;
}

async function EmitAcceptFilters() {
  initPageContent.value = await GetContentAsync();
	watchableShowFilters.value = !watchableShowFilters.value;
}

function EmitCleanFilters() {
	for (const filter of filtersV2.value) {
		filter.selectableValues.forEach((value, key) => {
			filter.selectableValues.set(key, false);
		})
	}

  searchInput.value = "";
	watchableShowFilters.value = !watchableShowFilters.value;
}

function EmitDeleteSingleFilter(filterType: typeof FilterTypes, tag: string) {
	console.log("loh: "+tag)
}

function EmitInputChange(newValue: string) {
  searchInput.value = newValue;
}

async function PressSearchEnter() {
	initPageContent.value = await GetContentAsync();
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
<template>
  <div class="material search-page__box">
    <div class="search-page__body">
      <async-search-selector
        v-model="searchInput"
        class="search-page__search m3-bg-1 m-radius-1"
        :values="searchSelectableValues"
        :placeholder="'Поиск по сайту'"
        @change:input="(newInput, isSelected) => searchByInput(newInput, isSelected)"
        @keyup.enter="PressSearchEnter"
      />
      <div class="row gap-8">
        <base-selector
          v-for="filter in filtersV2"
          :key="filter"
          v-model="filter.selectedValue"
          :menu-alignment="MenuAlignment.Left"
          :selectable-values="getFilterSelectableValues(filter.key)"
          :is-dropped="filter.isMenuDropped"
          class="search-page__filter m3-bg-1 m-radius-circle m-border m-border-hover"
          @update:model-value="(value: string) => { selectFilter(filter.key, value) }"
        >
          <template #header="{dropMenu}">
            <filter-chips
              :text="filter.selectedValue"
              :enable-menu-icon="true"
              @click="clickFilterDropMenu(filter, dropMenu)"
            >
              <template #menu-icon>
                <material-drop-arrow />
              </template>
            </filter-chips>
          </template>
        </base-selector>
      </div>

      <div
        v-if="isDataReady && initPageContent.Content.length > 0"
        class="search-page__content-box"
      >
        <SearchItem
          v-for="item in initPageContent.Content"
          :key="item"
          :item="item"
        />
      </div>
      <div v-else-if="isDataReady">
        Ничего не найдено
      </div>
    </div>

    <div v-if="false">
      <SearchFilters
        :filters="filtersV2"
        @accept:filters="EmitAcceptFilters"
        @clean:filters="EmitCleanFilters"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SearchFilters from '@/components/Search/Filter/SearchFilters.vue';
import {computed, inject, onMounted, ref} from "vue";
import {ContentService} from "@/api/ContentService";
import {V1GetByQueryRequest, V1GetByQuerySearchFilters} from "@/api/Requests/V1GetByQueryRequest";
import {V1GetByQueryResponse, V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";
import {ContentSelectedInfo} from "@/api/Enums/ContentSelectedInfo";
import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {Country} from "@/api/Enums/Country";
import {FilterTypes} from "@/components/Search/Models/FilterTypes";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import SearchItem from "@/components/Body/Search/SearchItem.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import {useRoute, useRouter} from "vue-router";

const contentService: ContentService = inject("content-service")

const filterByDefault = 'По умолчанию'
const typeFilters = new Map<ContentType, boolean>([
  [filterByDefault, false],
	[ContentType.Serial, false],
	[ContentType.Show, false],
	[ContentType.Film, false],
	[ContentType.Documentary, false]
]);
const statusFilters = new Map<ContentStatus, boolean>([
  [filterByDefault, false],
	[ContentStatus.Released, false],
	[ContentStatus.Ongoing, false],
	[ContentStatus.Finished, false],
]);
const countryFilters = new Map<Country, boolean>([
  [filterByDefault, false],
	[Country.Korea, false],
	[Country.China, false],
	[Country.Japan, false]
]);

//TODO:
// Добавить фильтр по году выпуска (от-до)
// Добавить фильтр по жанрам
// Добавить фильтр по статусу
const filtersV2 = ref<FilterUnitModel[]>([
	new FilterUnitModel('Тип', 'Тип', FilterTypes.ContentType as typeof FilterTypes, typeFilters, false),
	new FilterUnitModel('Статус', 'Статус', FilterTypes.ContentStatus as typeof FilterTypes, statusFilters, false),
	new FilterUnitModel('Страна', 'Страна', FilterTypes.Country as typeof FilterTypes, countryFilters, false)
]);

const router = useRouter()
const searchInput = ref<string>("");
const searchSelectableValues = computed(() => searchSelectableValuesModels.value.map(x => x.Title));
const searchSelectableValuesModels = ref<V1GetByQueryResponseContent[]>([]);
const initPageContent = ref<V1GetByQueryResponse>(null);
const isDataReady = ref(false);
const watchableShowFilters = ref(false);

onMounted(async () => {
  isDataReady.value = false;
  initPageContent.value = await search();
  isDataReady.value = true;
})

async function searchByInput(newInput: string, isSelected: boolean) {
  searchInput.value = newInput;

  const selectedContent = searchSelectableValuesModels.value.find(c => c.Title === newInput);
  if (isSelected) {
    await router.push({name: 'theater', params: {id: selectedContent.Id}})
    return;
  }

  const response = await search(false);
  searchSelectableValuesModels.value = response.Content;
}

async function search(addFilters: boolean = true) : Promise<V1GetByQueryResponse> {
	const request = new V1GetByQueryRequest();
	request.SelectedInfo = ContentSelectedInfo.ContentGenres | ContentSelectedInfo.Translations;
	request.Search = searchInput.value;

  if (addFilters) {
    request.Filters = new V1GetByQuerySearchFilters();
    request.Filters.ContentStatuses = GetArrayByFilterType<typeof ContentStatus>(FilterTypes.ContentStatus);
    request.Filters.ContentTypes = GetArrayByFilterType<typeof ContentType>(FilterTypes.ContentType);
    request.Filters.Countries = GetArrayByFilterType<typeof Country>(FilterTypes.Country);
  }

	return await contentService.V1GetByQuery(request);
}

function GetArrayByFilterType<T>(filterType: FilterTypes) {
	const response: typeof T[] = []

	for (const filter of filtersV2.value) {
		filter.selectableValues.forEach((value, key) => {
      if (key === filterByDefault) {
        return;
      }

			if (value && filter.type === filterType) {
				console.log(key);
				response.push(key as typeof T);
			}
		});
	}

	return response;
}

async function selectFilter(filterKey: string, selectedFilter: string) {
  const filter = filtersV2.value.find(filter => filter.key === filterKey);
  filter.isMenuDropped = false;
  if (selectedFilter === filterByDefault) {
    filter.selectedValue = filter.key;
  }

  filter.selectableValues.forEach((isEnabled, key) => {
    if (key === selectedFilter) {
      filter.selectableValues.set(key, true);
    } else {
      filter.selectableValues.set(key, false);
    }
  });

  initPageContent.value = await search(true);
}

function clickFilterDropMenu(filter: FilterUnitModel, dropMenu: (boolean) => any) {
  filter.isMenuDropped = !filter.isMenuDropped;
  dropMenu(filter.isMenuDropped);
}

function getFilterSelectableValues(filterKey: string): string[] {
  const filter = filtersV2.value.find(f => f.key === filterKey);

  const result = [];
  for (const value of filter.selectableValues.keys()) {
    result.push(value)
  }

  return result;
}

async function EmitAcceptFilters() {
  initPageContent.value = await search();
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

async function PressSearchEnter() {
	initPageContent.value = await search(true);
}
</script>

<style lang="scss" scoped>
.search-page {
  &__filter {
    display: flex;
    height: fit-content;
  }

  &__box {
    padding: 20px 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
  }

  &__content-box {
    width: 100%;
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-flow: row;
  }

  &__search {
    background: var(--surface-container-lowest100);
    border: 1px solid var(--outline-variant-light);
    transition:
      background-color 0.2s,
      border-top-color 0.15s,
      border-bottom-color 0.15s,
      border-right-color 0.15s,
      border-left-color 0.15s;

    &:hover {
      border: 1px solid var(--primary40);
    }

    &:focus-within {
      border: 1px solid var(--secondary);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
}
</style>
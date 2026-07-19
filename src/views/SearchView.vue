<template>
  <div class="material search-page__box">
    <div class="search-page__body">
      <async-search-selector
        v-model="searchInput"
        class="search-page__search m3-bg-1 m-radius-1"
        :values="searchSelectableValues"
        :placeholder="'Поиск по сайту'"
        :call-updater-delay="500"
        :is-dropped="isSearchMenuDropped"
        @change:input="(newInput, isSelected) => searchByInput(newInput, isSelected)"
        @keyup.enter="PressSearchEnter"
      />
      <div class="search-page__filters gap-8">
        <year-range-filter
          :year-from="yearFrom"
          :year-to="yearTo"
          @apply="applyYearRange"
        />
        <base-selector
          v-for="filter in filtersV2"
          :key="filter.key"
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
          v-for="content in initPageContent.Content"
          :key="content.Content.Id"
          :content="SearchContentFactory.getContentViewModel(content)"
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
import {ContentSortBy} from "@/api/Enums/ContentSortBy";
import {ContentType} from "@/api/Enums/ContentType";
import {ContentStatus} from "@/api/Enums/ContentStatus";
import {Country} from "@/api/Enums/Country";
import {Language} from "@/api/Enums/Language";
import {SortDirection} from "@/api/Enums/SortDirection";
import {TranslatorService} from "@/api/TranslatorService";
import {FilterTypes} from "@/components/Search/Models/FilterTypes";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import SearchItem from "@/components/Body/Search/SearchItem.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import {useRouter} from "vue-router";
import {SearchContentFactory} from "@/components/Body/Search/SearchItemViewFactory";
import YearRangeFilter from "@/components/Search/Filter/YearRangeFilter.vue";

const contentService: ContentService = inject("content-service")
const translatorService: TranslatorService = inject("translator-service")

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
	[ContentStatus.Announced, false],
	[ContentStatus.Ongoing, false],
	[ContentStatus.Finished, false],
]);
const countryFilters = new Map<Country, boolean>([
  [filterByDefault, false],
	[Country.Korea, false],
	[Country.China, false],
	[Country.Japan, false]
]);

const sortLabelToContentSortBy = new Map<string, ContentSortBy>([
  ['Просмотры', ContentSortBy.Views],
  ['Рейтинг', ContentSortBy.Rating],
  ['Дата выхода', ContentSortBy.ReleasedAt],
  ['Последнее обновление', ContentSortBy.LastUpdateAt],
  ['Создано', ContentSortBy.CreatedAt],
]);

const sortFilters = new Map<string, boolean>([[filterByDefault, false]]);
for (const label of sortLabelToContentSortBy.keys()) {
  sortFilters.set(label, false);
}

const languageFilters = new Map<string, boolean>([
  [filterByDefault, false],
  [Language.Russian, false],
  [Language.English, false],
  [Language.Korean, false],
  [Language.Chinese, false],
  [Language.Japanese, false],
]);

const translatorFilters = new Map<string, boolean>([[filterByDefault, false]]);
const translatorNameToId = new Map<string, number>();

const filtersV2 = ref<FilterUnitModel[]>([
	new FilterUnitModel('Тип', 'Тип', FilterTypes.ContentType as typeof FilterTypes, typeFilters, false),
	new FilterUnitModel('Статус', 'Статус', FilterTypes.ContentStatus as typeof FilterTypes, statusFilters, false),
	new FilterUnitModel('Страна', 'Страна', FilterTypes.Country as typeof FilterTypes, countryFilters, false),
	new FilterUnitModel('Сортировка', 'Сортировка', FilterTypes.SortBy as typeof FilterTypes, sortFilters, false),
	new FilterUnitModel('Язык', 'Язык', FilterTypes.Language as typeof FilterTypes, languageFilters, false),
	new FilterUnitModel('Переводчик', 'Переводчик', FilterTypes.Translator as typeof FilterTypes, translatorFilters, false),
]);

const router = useRouter()
const searchInput = ref<string>("");
const searchSelectableValues = computed(() => searchSelectableValuesModels.value.map(x => x.Content.Title));
const searchSelectableValuesModels = ref<V1GetByQueryResponseContent[]>([]);
let isSearchMenuDropped = ref<boolean>(false);

const initPageContent = ref<V1GetByQueryResponse>(null);
const isDataReady = ref(false);
const watchableShowFilters = ref(false);
const yearFrom = ref<number | null>(null);
const yearTo = ref<number | null>(null);

onMounted(async () => {
  isDataReady.value = false;
  await loadTranslators();
  initPageContent.value = await search();
  isDataReady.value = true;
})

async function loadTranslators() {
  const response = await translatorService.query({
    Limit: 100,
    Search: null,
    Offset: 0,
    TranslatorIds: null,
  });

  const nameCounts = new Map<string, number>();

  for (const translator of response.Translators) {
    let label = translator.Name;
    const count = (nameCounts.get(translator.Name) ?? 0) + 1;
    nameCounts.set(translator.Name, count);

    if (count > 1) {
      label = `${translator.Name} (#${translator.TranslatorId})`;
    }

    translatorFilters.set(label, false);
    translatorNameToId.set(label, translator.TranslatorId);
  }
}

async function searchByInput(newInput: string, isSelected: boolean) {
  isSearchMenuDropped.value = false;
  searchInput.value = newInput;

  const selectedContent = searchSelectableValuesModels.value.find(c => c.Content.Title === newInput);
  if (isSelected) {
    await router.push({name: 'theater', params: {id: selectedContent.Content.Id}})
    return;
  }

  const response = await search(false);
  searchSelectableValuesModels.value = response.Content;
  isSearchMenuDropped.value = searchSelectableValuesModels.value.length > 0 && newInput.length > 0;
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
    request.Filters.Languages = GetArrayByFilterType<typeof Language>(FilterTypes.Language);
    request.Filters.TranslatorIds = GetSelectedTranslatorIds();
    request.Filters.YearFrom = yearFrom.value;
    request.Filters.YearTo = yearTo.value;

    const sortLabel = GetSelectedFilterKey<string>(FilterTypes.SortBy);
    request.SortBy = sortLabel ? sortLabelToContentSortBy.get(sortLabel) ?? null : null;
    request.SortDirection = SortDirection.Desc;
  }

	return await contentService.V1GetByQuery(request);
}

function GetSelectedFilterKey<T>(filterType: typeof FilterTypes[keyof typeof FilterTypes]): T | null {
  for (const filter of filtersV2.value) {
    if (filter.type !== filterType) {
      continue;
    }

    for (const [key, isEnabled] of filter.selectableValues) {
      if (key === filterByDefault || !isEnabled) {
        continue;
      }

      return key as T;
    }
  }

  return null;
}

function GetSelectedTranslatorIds(): number[] {
  const translatorLabel = GetSelectedFilterKey<string>(FilterTypes.Translator);
  if (!translatorLabel) {
    return [];
  }

  const translatorId = translatorNameToId.get(translatorLabel);
  return translatorId != null ? [translatorId] : [];
}

function GetArrayByFilterType<T>(filterType: FilterTypes) {
	const response: typeof T[] = []

	for (const filter of filtersV2.value) {
		filter.selectableValues.forEach((value, key) => {
      if (key === filterByDefault) {
        return;
      }

			if (value && filter.type === filterType) {
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

async function applyYearRange(value: {yearFrom: number | null, yearTo: number | null}) {
  yearFrom.value = value.yearFrom;
  yearTo.value = value.yearTo;
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
  yearFrom.value = null;
  yearTo.value = null;
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
    flex: 0 0 auto;
    width: fit-content !important;
    height: fit-content;
  }

  &__filters {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
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

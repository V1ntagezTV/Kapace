<template>
  <div class="search-tags">
    <template v-for="([filterType, values], index) in acceptedFiltersByFilterType" :key="index">
      <template v-for="filter in values" :key="filter">
        <BaseBackground
          :type="3"
          class="search-tags__container"
          @click="onClickTag(filterType, filter)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8" cy="8"
              r="7" fill="#FF776F"
            />
            <path
              d="M5 5L11 11" stroke="white"
              stroke-width="1.2" stroke-linecap="round"
            />
            <path
              d="M11 5L5 11" stroke="white"
              stroke-width="1.2" stroke-linecap="round"
            />
          </svg>

          <a>{{ filterType }} {{ filter }} {{ index }}</a>
        </BaseBackground>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
import BaseBackground from '../../Base/BaseBackground.vue';
import {defineEmits, PropType, ref, watch} from "vue";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import {FilterTypes} from "@/components/Search/Models/FilterTypes";

const emits = defineEmits<{
	(emitName: 'delete:filter', filterType: typeof FilterTypes, tag: string) : void,
}>()

const acceptedFiltersByFilterType = ref<Map<typeof FilterTypes, string[]>>(new Map<typeof FilterTypes, string[]>());

watch(() => props.watchShowFilters, () => {
	acceptedFiltersByFilterType.value = new Map<typeof FilterTypes, string[]>();
	for (const filter of props.filters) {
		filter.values.forEach((value: boolean, key: string) => {
			if (value) {
				const byFilter = acceptedFiltersByFilterType.value.get(filter.type);

				if (byFilter) {
					byFilter.push(key);
				} else {
					acceptedFiltersByFilterType.value.set(filter.type, [key]);
				}
			}
		})
	}
})

const props = defineProps({
	watchShowFilters: {type: Boolean, required: true},
	filters: {type: Object as PropType<Array<FilterUnitModel>>, required: true}
});

function onClickTag(filterType: typeof FilterTypes, tag: string) {
	emits('delete:filter', filterType, tag);
}

</script>

<style lang="scss">
.search-tags {
  height: fit-content;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0;
  gap: 10px;

  &__container {
    height: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    gap: 4px;
    font-weight: 600;
    font-size: 14px;
    line-height: 12px;

		transition: border 0.25s, color 0.25s;

		&:hover {
			cursor: pointer;
			background-color: #EEEFF4;
			border: 1.5px solid var(--font-gray-v4);
		}
  }
}
</style>
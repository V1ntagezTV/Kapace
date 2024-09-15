<template>
  <div class="search-filters__main">
    <FilterUnit
      v-for="filter in filters"
      :key="filter"
      :filter="filter"
    />

    <div class="search-filters__actions-container">
      <BaseButton
        class="body-medium m-radius-circle"
        :button-type="2"
        :variant="'filled'"
        @click="onClickAcceptFilters"
      >
        Принять
      </BaseButton>
      <BaseButton
        class="m-radius-circle"
        :variant="'outline'"
        @click="onClickCleanFilters"
      >
        Сбросить
      </BaseButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, PropType, ref} from 'vue';
import FilterUnit from "@/components/Search/Filter/FilterUnit.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";

const emits = defineEmits<{
  (emitName: 'accept:filters') : void,
  (emitName: 'clean:filters') : void,
}>()

const props = defineProps({
	filters: {type: Array as PropType<Array<FilterUnitModel>>, required: true}
})

const filters = ref<Array<FilterUnitModel>>(props.filters);

function onClickCleanFilters() {
	console.log(filters.value)
	console.log('onClick clean')
  filters.value.forEach((value, index) => {
		const filterUnit = filters.value[index];
		for (const filterKey in filterUnit.selectableValues) {
			filterUnit.selectableValues.set(filterKey, false);
		}
  });

  emits('clean:filters');
}

function onClickAcceptFilters() {
	console.log('onClick accept');
	console.log(filters.value);
	emits('accept:filters');
}

</script>

<style lang="scss" scoped>

.search-filters {
  &__main {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__actions-container{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
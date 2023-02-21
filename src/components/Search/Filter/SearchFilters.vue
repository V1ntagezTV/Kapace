<template>
  <div class="search-filters__main">
    <BaseBackground>
      <FilterUnit
        v-for="filter in filters"
        :key="filter"
        ref="filterUnit"
        :filter="filter"
        :clear-trigger="clearTrigger"
        @add:accepted-filters="inputFilterSelected"
      />
    </BaseBackground>

    <div class="search-filters__actions-container">
      <BaseButton :button-type="2" @click="AcceptFilters">
        Принять
      </BaseButton>
      <BaseButton @click="CleanFiltersByParent">
        Сбросить
      </BaseButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, reactive, ref} from 'vue';
import FilterUnit from "@/components/Search/Filter/FilterUnit.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import {SearchEmits} from "@/components/Search/Models/SearchEmits";

const emits = defineEmits<{
  (emitName: 'update:acceptedFilters', filters: string[]) : void,
  (emitName: 'clean:accepted-filters') : void,
  (emitName: 'add:accepted-filters', key: string, value: boolean) : void,
}>()

let clearTrigger = ref(false)
let emitAcceptedFilters = new Map<string, boolean>()

const filters = [
  new FilterUnitModel('Тип', 'Flags', new Map<string, boolean>([["key1", false], ["key2", false]])),
  new FilterUnitModel('Статус', 'Flags', new Map<string, boolean>([["key3", false], ["key4", false]])),
  new FilterUnitModel('Стрнана', 'Flags', new Map<string, boolean>([["key5", false], ["key6", false]]))
];

function inputFilterSelected(key: string, value: boolean) {
  emitAcceptedFilters.set(key, value)
  console.log(emitAcceptedFilters)
}

function CleanFiltersByParent() {
  clearTrigger.value = !clearTrigger.value

  console.log(clearTrigger)
  emits(SearchEmits.Clean)
}

function AcceptFilters() {
  let resultFilters = []

  emitAcceptedFilters.forEach((value, key) => {
    if (value) {
      resultFilters.push(key)
    }
  })

  emits('update:acceptedFilters', resultFilters)
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
    gap: 10px;
    width: 100%;
  }
}
</style>
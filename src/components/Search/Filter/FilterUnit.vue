<template>
  <div class="filter-unit__header-button">
    <BaseSelector
      class="m3-bg-1 m-radius-1 m-border m-border-hover"
      :title="filter.name"
      :menu-alignment="MenuAlignment.Right"
      :selectable-values="getKeyValues()"
      @update:model-value="selectClick"
    />
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref} from 'vue'
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";

const props = defineProps({
  show: {type: Boolean, default: true, required: false},
  filter: {type: Object as PropType<FilterUnitModel>, required: true},
});

const inputValues = ref(props.filter.selectableValues);

function getKeyValues(): string[] {
  const result = [];
  for (const value of props.filter.selectableValues.keys()) {
    result.push(value)
  }

  return result;
}

function selectClick(key: string) : void {
  const value = inputValues.value[key];
  inputValues.value.set(key, !value);
}

</script>

<style lang="scss">

.filter-unit {
  &__header-button {
    display: flex;
    width: 250px;
  }

  &__arrow-icon {
    height: 20px;
    width: 20px;
  }

  &__input-container {
    display: flex;
    padding: 6px 20px;
    align-items: center;
    justify-content: flex-start;

    &:hover {
      cursor: pointer;
      background: #F4F5F7;
    }
  }

  &__label {
    margin-left: 4px;
    font-weight: 400;
    font-size: 14px;
    text-align: left;
    letter-spacing: 0.02em;
    cursor: pointer;
    -webkit-user-select: none;
  }
}

.content {
  &-enter-from {
    opacity: 0;
  }

  &-enter-active {
    transition: opacity 0.5s ease;
  }

  &-enter-to {
    opacity: 100;
  }
}
</style>
<template>
  <div :class="{'selector__box': !markAsInvalidInput, 'selector__box selector__invalid-box': markAsInvalidInput }">
    <label v-if="label" class="selector__label">{{ label }}</label>

    <button
      v-if="titleRef === title"
      class="selector__title"
      @click="onClickOnHeader"
    >
      {{ titleRef }}
      <drop-arrow />
    </button>
    <button
      v-else
      class="selector__title selector__title-selected"
      @click="onClickOnHeader"
    >
      {{ titleRef }}
      <drop-arrow />
    </button>

    <div
      v-if="isActive"
      class="selector__menu"
      @click="onClickOnMenu"
    >
      <button
        v-for="value in selectableValues" :key="value"
        @click="selectValue(value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref} from "vue";
import DropArrow from "@/components/Icons/DropArrow.vue";

const emits = defineEmits<{(emit: 'update:modelValue', value: string)}>();

const props = defineProps({
  title: {type: String, required: true},
  label: {type: String, required: false, default: null},
  selectableValues: {type: Array as PropType<String[]>, required: true},
  modelValue: {type: String, default: ""},
  markAsInvalidInput: {type: Boolean, default: false},
});

const isActive = ref(false);
const titleRef = ref(props.title);

function onClickOnHeader() {
  isActive.value = !isActive.value;
}

function onClickOnMenu() {
  isActive.value = false;
}

function selectValue(value: string) {
  titleRef.value = value;
  emits('update:modelValue', value);
}

</script>

<style lang="scss" scoped>
.selector {
  &__title {
    display: grid;
    grid-template-columns: 1fr min-content;
    grid-gap: 10px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;

    padding: 6px 10px 6px 10px;
    align-items: center;

    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #777777;

    text-decoration: none;
    border: none;
    outline: none;
    background: none;

    &-selected {
      color: var(--font-light-black);
    }
  }

  &__menu {
    display: grid;
    width: 100%;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
    position: absolute;
    left: 0;
    top: 100 + 10%;
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid var(--primary);
    border-radius: 6px;
    transition: outline-width 0.3s, outline-color 0.3s;
    background: white;
    z-index: 999999999;

    & button {
      padding: 6px 10px 6px 10px;
      align-items: center;

      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;

      text-decoration: none;
      border: none;
      outline: none;
      background: none;

      &:hover {
        background: #F4F5F7;
      }
    }
  }

  &__box {
    display: grid;
    height: 48px;
    width: fit-content;
    position: relative;

    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    border: 1px solid var(--font-gray-v1);
    border-radius: 6px;
    transition:
        border-left-color 0.3s,
        border-right-color 0.3s,
        border-top-color 0.3s,
        border-bottom-color 0.3s;

    &:hover {
      border: 1px solid var(--primary);
      color: var(--primary);
    }

    &:focus-within {
      border: 1px solid var(--primary);
      color: var(--primary);
    }
  }

  &__invalid-box {
    border: 1px solid var(--warning-red);
  }

  &__label {
    background: white;
    position: absolute;
    left: 12px;
    top: -9px;
    width: fit-content;

    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    padding-left: 4px;
    padding-right: 4px;
  }
}

</style>
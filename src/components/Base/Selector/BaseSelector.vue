<template>
  <div
    class="selector__box"
    :class="{'selector__box-errored': markAsInvalidInput }"
  >
    <label v-if="label" class="selector__label">{{ label }}</label>
    <!-- Button -->
    <slot name="header" :dropMenu="clickOnHeader">
      <filter-chips
        class="selector__button"
        :class="{
          'selector__button-selected': titleRef.value !== props.title,
          'selector__button-bordered': props.buttonBorder,
          'selector__disabled': props.isDisabled }"
        :text="titleRef"
        :enable-menu-icon="true"
        @click.stop="clickOnHeader(!isDroppedRef)"
      >
        <template #menu-icon>
          <material-drop-arrow :class="{'selector__disabled': props.isDisabled }" />
        </template>
      </filter-chips>
    </slot>

    <!-- Menu -->
    <div
      v-show="isDroppedRef && selectableValues.length > 0"
      class="selector__menu selector__title-bordered"
      :class="getMenuAlignmentClasses()"
      @click="clickOnMenu"
    >
      <button
        v-for="value in selectableValues" :key="value"
        class="selector__menu-button"
        @click="selectFilter(value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref, watch} from "vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import {prop} from "vue-class-component";

const emits = defineEmits<{(emit: 'update:modelValue', value: string): void}>();

//TODO: Хорошо бы стили относящиеся к дефолтной кнопке вынести в отдельную модельку типа defaultStyles: {title, label, buttonBorder, buttonBackground}
const props = defineProps({
  modelValue: {required: true, default: ""},
  title: {type: String, required: false, default: ""},
  label: {type: String, required: false, default: null},
  buttonBorder: {type: Boolean, default: false},
  buttonBackground: {type: String, default: 'none'},
  markAsInvalidInput: {type: Boolean, default: false},
  isDisabled: {type: Boolean, default: false, required: false},

  selectableValues: {type: Array as PropType<String[]>, required: true},
  menuAlignment: {type: Number as PropType<MenuAlignment>, default: MenuAlignment.Right},
  isDropped: {type: Boolean, default: false, required: false}
});

const titleRef = ref(((props.modelValue?.length ?? 0) > 0) ? props.modelValue : props.title ?? "");
const isDroppedRef = ref(false);

// Синхронизация локального состояния с пропсом
watch(() => props.modelValue, (newValue) => {
  titleRef.value = newValue;
});
// Синхронизация локального состояния с пропсом
watch(() => props.isDropped, (newValue) => {
  isDroppedRef.value = newValue;
});
/* Сбрасывает текущее выбранное значение если компонент был помечен isDisabled */
watch(() => props.isDisabled, (isDisabled) => {
  if (!isDisabled) {
    return;
  }

  titleRef.value = props.title;
})

function clickOnHeader(isDropped: boolean) {
  if (props.isDisabled) {
    isDroppedRef.value = false;
    return;
  }

  if (props.selectableValues.length > 0) {
    isDroppedRef.value = isDropped;
    return;
  }

  isDroppedRef.value = false;
}

function clickOnMenu() {
  isDroppedRef.value = false;
}

function selectFilter(value: string) {
  titleRef.value = value;
  isDroppedRef.value = false;
  emits('update:modelValue', value);
}

function getMenuAlignmentClasses() {
  return [
    props.menuAlignment === MenuAlignment.Left ? 'selector__menu-left' : '',
    props.menuAlignment === MenuAlignment.Right ? 'selector__menu-right' : ''
  ]
}

</script>

<style lang="scss" scoped>
.selector {
  &__label {
    background: white;
    position: absolute;
    left: 12px;
    top: -9px;
    width: fit-content;

    padding-left: 4px;
    padding-right: 4px;
  }

  &__font-style {
    font-weight: 500;
    font-size: 14px;
    line-height: 143%;
    letter-spacing: 0.04em;
    text-align: center;

    padding: 0 8px;
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 18px;
    width: 18px;
  }

  &__button {
    display: flex;
    height: 100%;
    width: 100%;
    background: v-bind(background);
    justify-content: center;
    align-items: center;

    &-selected {
      color: var(--font-light-black);
    }

    &-bordered {
      border: 1px solid #767680;
      border-radius: 8px;
    }
  }

  &__box {
    display: flex;
    height: 48px;
    width: 100%;
    justify-content: center;
    align-items: center;
    position: relative;

    &-errored {
      border: 1px solid var(--warning-red);
    }
  }

  &__disabled {
    color: rgba(var(--on-surface-rgb), 0.30);
  }

  &__menu {
    display: grid;
    width: 200px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
    position: absolute;
    top: 100%;

    margin-top: 8px;

    padding: 8px 0;

    border-radius: 8px;
    transition: outline-width 0.3s, outline-color 0.3s;
    background: var(--surface-container-default94);
    z-index: 999999999;

    box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.15),
                0 1px 2px 0 rgba(0, 0, 0, 0.3);

    &-bordered {
      border: 1px solid #767680;
      border-radius: 8px;
    }

    &-left { left: 0; }
    &-right { right: 0; }
  }

  &__menu-button {
    height: 40px;
    padding: 0 16px;
    text-align: start;

    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    &:hover {
      background: var(--surface-container-highest90);
    }
  }
}

</style>
<template>
  <div class="input__input-box">
    <label v-if="label" class="input__label">{{ label }}</label>
    <input
      v-model="inputValue"
      v-bind="$attrs"
      class="input__input"
      :placeholder="props.placeHolder"
      :type="type"
    >
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
const inputValue = ref("");

const props = defineProps({
  placeHolder: {type: String, required: true, default: 'Введите текст'},
  label: {type: String, required: false, default: undefined},
  type: {type: String, required: false, default: "text"}
});
</script>

<style lang="scss" scoped >
.input {
  &__close-box {
    display: flex;
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
    position: relative;

    & svg {
      height: fit-content;
      width: fit-content;
    }

    &:hover::after {
      opacity: 0;
    }

    &:hover {
      content: "";
      border-radius: 50%;
      background-color: #adadad;
      opacity: 1;
    }
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

  &__input-box {
    display: flex;
    height: 48px;
    width: 100%;

    justify-content: center;
    align-items: center;
    gap: 10px;
    outline: 1px solid var(--font-gray-v1);
    border-radius: 4px;
    position: relative;
    transition: outline-width 0.3s, outline-color 0.3s;

    &:hover {
      outline: 1px solid var(--primary);
      color: var(--primary);
    }

    &:focus-within {
      outline: 1px solid var(--primary);
      color: var(--primary);
    }
  }

  &__input {
    display: flex;
    height: 100%;
    width: 100%;
    padding: 0 0 0 16px;

    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    border: none;
    outline: none;

    &:hover {
      outline: none;
    }
  }
}

</style>
<template>
  <div class="textarea__box">
    <label v-if="label" class="textarea__label">{{ label }}</label>
    <textarea
      :value="modelValue"
      class="textarea__text-area"
      :class="{
        'textarea__text-area': !markAsInvalidInput,
        'textarea__text-area textarea__invalid-box': markAsInvalidInput
      }"
      placeholder="Описание"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script lang="ts" setup>
import {defineEmits} from "vue";

defineEmits(['update:modelValue'])
const props = defineProps({
  label: {type: String, required: false, default: null},
  modelValue: {type: String, default: ""},
  markAsInvalidInput: {type: Boolean, default: false},
});
</script>

<style lang="scss" scoped>
.textarea {
  &__box {
    display: flex;
    position: relative;
    height: 100%;
  }

  &__text-area {
    display: flex;
    height: 100%;
    width: 100%;
    resize: vertical;
    padding: 10px 16px 10px 16px;

    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    border: none;
    outline: 1px solid var(--font-gray-v1);
    border-radius: 6px;
    transition: outline-width 0.3s, outline-color 0.3s;

    &:hover {
      outline: 1px solid var(--primary);
    }

    &:focus-within {
      outline: 1px solid var(--primary);
    }
  }

  &__invalid-box {
    outline: 1px solid var(--warning-red);
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
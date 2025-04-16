<template>
  <div
    class="textarea__box m-radius-1"
    :class="{'textarea__invalid-box': markAsInvalidInput }"
  >
    <label v-if="label" class="textarea__label">{{ label }}</label>
    <textarea
      :value="modelValue"
      class="textarea__text-area body-medium material textarea__text-area"
      :placeholder="placeholder"
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
  placeholder: {type: String, default: null}
});
</script>

<style lang="scss" scoped>
.textarea {
  &__box {
    display: flex;
    position: relative;
    height: fit-content;
  }

  &__text-area {
    display: flex;
    width: 100%;
    min-height: inherit;

    resize: vertical;
    padding: 8px 16px 8px 16px;

    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    background: none;

    outline: none;
    border: none;
    transition: outline-width 0.3s, outline-color 0.3s;
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
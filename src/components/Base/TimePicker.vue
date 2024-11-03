<template>
  <div class="time-picker__box">
    <label v-if="label" class="time-picker__label">{{ label }}</label>
    <input
      v-model="refModel"
      type="time"
      class="material time-picker"
      @input="onChange(refModel)"
    >
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, defineProps, ref, watch} from 'vue';

const emits = defineEmits<{(emit: 'update:modelValue', value: string)}>()

const props = defineProps({
  label: {type: String, required: false, default: null},
  modelValue: {type: String, default: null}
});

function onChange(input: string) {
  emits('update:modelValue', input);
}

const refModel = ref<string>(props.modelValue);

watch(() => props.modelValue, (newValue) =>  {
  refModel.value = newValue;
})
</script>

<style lang="scss" scoped>
.time-picker {
  display: grid;
  height: 48px;

  padding: 6px 10px 6px 10px;

  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  justify-content: center;

  background: none;
  text-decoration: none;
  border: none;
  outline: none;
  transition: outline-width 0.3s, outline-color 0.3s;

  &::-webkit-calendar-picker-indicator {
    display: none;
  }

  &__box {
    display: grid;
    position: relative;
    height: 48px;
    background: none;
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
<template>
  <div class="input__box">
    <label v-if="label" class="input__label">{{ label }}</label>
    <input
      type="date"
      class="input"
      @input="onInput($event.target.value)"
    >
  </div>
</template>

<script lang="ts" setup>
import {} from 'vue';

const emits = defineEmits<{(emit: 'update:modelValue', value: Date)}>();

const props = defineProps({
  label: {type: String, required: false, default: null},
  modelValue: {type: Date, default: null},
});

function onInput(value: string) {
  const split = value.split('-'), year = Number(split[0]), month = Number(split[1]), day = Number(split[2]);

  emits('update:modelValue', new Date(year, month, day));
}
</script>

<style lang="scss" scoped>
.input {
  display: grid;
  height: 48px;

  padding: 6px 10px 6px 10px;

  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  justify-content: center;

  text-decoration: none;
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
  &::-webkit-calendar-picker-indicator {
    display: none;
  }

  &__box {
    display: grid;
    position: relative;
    height: 48px;

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
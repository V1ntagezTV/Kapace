<template>
  <div
    class="input__input-static-box"
    :class="{'input__input-invalid-box': markAsInvalidInput }"
  >
    <label
      v-if="label"
      class="material body-small input__label"
      :class="{'input__label-errored': markAsInvalidInput }"
    >
      {{ label }}
    </label>
    <input
      v-model="refValue"
      v-bind="$attrs"
      class="input__input"
      :placeholder="placeHolder"
      :type="type"
      :disabled="disabled"
      @input="onInput($event.target.value)"
    >
    <slot name="end-icon" />
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, ref, watch} from "vue";

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {default: ""},
  placeHolder: {type: String, required: false, default: 'Введите пароль'},
  label: {type: String, required: false, default: undefined},
  type: {type: String, required: false, default: "text"},
  markAsInvalidInput: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  inputValidator: {
    type: Function as () => (value: string) => boolean,
    default: () => (_: string) => true,
    required: false
  }
});

const refValue = ref<string>(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  refValue.value = newValue;
});

// eslint-disable-next-line vue/no-setup-props-destructure
let lastValidValue: string = props.modelValue;
function onInput(newValue: string) {
  if (!props.inputValidator(newValue)) {
    refValue.value = lastValidValue;
    return;
  }

  refValue.value = newValue;
  lastValidValue = newValue;
  emits('update:modelValue', newValue);
}
</script>

<style lang="scss" scoped>
.no-spinners::-webkit-inner-spin-button,
.no-spinners::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinners {
  -moz-appearance: textfield;
}

.input {
  &__label {
    background: white;
    position: absolute;
    left: 12px;
    top: -9px;
    width: fit-content;
    padding: 0 4px;

    font-family: var(--body-small-font-family-name);
    font-style: var(--body-small-font-family-style);
    font-weight: var(--body-small-font-weight);
    font-size: var(--body-small-font-size);
    letter-spacing: var(--body-small-letter-spacing);
    line-height: var(--body-small-line-height);

    color: var(--on-surface-variant-light);

    &-errored {
      border: 1px solid var(--warning-red);
    }
  }

  &__input-static-box {
    display: flex;
    flex-direction: row;
    height: 48px;
    width: 100%;

    justify-content: center;
    align-items: center;
    position: relative;
    padding-right: 4px;
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
    background: none;

    &:hover {
      outline: none;
    }

    &-invalid-box {
      border: 1px solid var(--error40);
    }
  }
}

</style>
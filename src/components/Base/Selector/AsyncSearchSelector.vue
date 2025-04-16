<template>
  <base-selector
    v-model="selectedValue"
    :mark-as-invalid-input="isInvalid"
    :selectable-values="values"
    :menu-alignment="MenuAlignment.Left"
    :is-dropped="isDroppedRef"
    @input="onChangeInput"
    @update:model-value="onSelectValue"
  >
    <template #header="{dropMenu}">
      <div class="search-selector__box">
        <base-input
          v-model="textInput"
          :place-holder="placeholder"
          @keyup="searchByContentInput(dropMenu)"
          @keydown.enter.stop="emits('onkeydown:enter', textInput)"
        />

        <icon-button
          v-if="textInput.length > 0"
          @click="cleanInputButton"
        >
          <xIcon style="color: var(--on-surface-variant-light)" />
        </icon-button>

        <icon-button
          v-if="showLoopIcon"
        >
          <loop-icon style="color: var(--primary40)" />
        </icon-button>
      </div>
    </template>
  </base-selector>
</template>

<script setup lang="ts">
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import {defineEmits, PropType, ref, watch} from "vue";
import LoopIcon from "@/components/Icons/LoopIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";

const props = defineProps({
  input: {type: String, required: false, default: ""},
  placeholder: {type: String, required: true},
  values: {type: Object as PropType<Array<string>>, required: true, default: new Array<string>()},
  isInvalid: {type: Boolean, required: false, default: false},
  showLoopIcon: {type: Boolean, required: false, default: true},
  isDropped: {type: Boolean, required: false, default: false},
  callUpdaterDelay: {type: Number, required: false, default: 0}
});

const textInput = ref(props.input);
const isDroppedRef = ref(props.isDropped);
const selectedValue = ref("");
let dropMenuTimeout: NodeJS.Timeout = null;

watch(() => props.input, (newValue) => {
  textInput.value = newValue;
});

watch(() => props.isDropped, (newValue) => {
  isDroppedRef.value = newValue;
  console.log('DROP MENU:' + newValue);
});

const emits = defineEmits<{
  (emitName: 'change:input', input: string, isSelect: boolean) : void,
  (emitName: 'onkeydown:enter', input: string) : void
}>();

function onChangeInput() {
  clearTimeout(dropMenuTimeout);

  if (textInput.value.length === 0) {
    emits('change:input', textInput.value, false);
    return;
  }

  dropMenuTimeout = setTimeout(() => {
    emits('change:input', textInput.value, false);
  }, props.callUpdaterDelay);
}

function onSelectValue(value: string) {
  textInput.value = value;
  emits('change:input', textInput.value, true);
}

function searchByContentInput(dropMenuAction: (boolean) => void) {
  if (textInput.value.length > 0) {
    dropMenuAction(isDroppedRef.value);
    return;
  }

  dropMenuAction(isDroppedRef.value);
}

function cleanInputButton() {
  textInput.value = "";
  selectedValue.value = "";

  emits('change:input', textInput.value, false);
  onChangeInput();
}
</script>

<style lang="scss" scoped>
.search-selector {
  &__box {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: row;
    align-items: center;

    margin: 0 8px 0 0;
  }
}
</style>
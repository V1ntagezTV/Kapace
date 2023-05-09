<template>
  <BaseBackground :type="3" class="search-component__search">
    <input
      v-model="innerInputText "
      class="search-component__input"
      placeholder="Поиск по сайту"
      type="search"
      @input="onChange"
    >
    <div class="search-component__splitter" />
    <button class="search-component__search-button">
      <LoopIcon />
    </button>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import LoopIcon from "@/components/Icons/LoopIcon.vue";
import {defineEmits, ref} from "vue";


const props = defineProps({
	inputText: {type: String, required: true}
});

const innerInputText = ref(props.inputText);

const emits = defineEmits<{
  (emitName: 'change:input-change', input: string) : void
}>()

function onChange() {
  emits('change:input-change', innerInputText.value);
}

</script>

<style lang="scss">

.search-component {
  &__search {
    display: flex;
    flex-direction: row;
    align-items: center;

    width: 100%;
    height: 40px;

    align-self: stretch;
		transition: outline-width 0.1s, outline-color 0.25s;
		border: none;
		outline-offset: -1px;
		outline: 1px solid var(--font-gray-v1);

		& p {
			margin: 0;
		}

		&:hover {
			outline: 1px solid var(--primary);
		}

		&:focus-within {
			transition: outline-width 0.1s, outline-color 0.1s;
			outline: 1px solid var(--secondary);
		}
  }

  &__input {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 15px;
    display: flex;
    align-items: center;
    text-align: justify;
    letter-spacing: 0.055em;
    height: 100%;
    width: inherit;
    color: #474A57;
		border: none;
    outline: none;
    padding: 0 20px;

    &::placeholder {
      text-decoration: 0;
			border: none;
			outline: none;
      color: #969BAB;
    }
  }

    &__splitter {
      width: 1px;
      height: 100%;
      border: 1px solid #F7F7FF;
    }

    &__search-button {
      width: 70px;
      height: 100%;
      text-decoration: 0;
      border-radius: 0;
      border-color: transparent;
      border-width: 0;
      padding: 0;
      background-color: #576999;
      color: white;
      transition: background-color 0.25s, color 0.25s;

      &:hover {
        background-color: #6686B3;
        cursor: pointer;
        color: white;
      }
    }

    &__filter-container {
      height: 100%;
      padding: 0 15px;
      color: #474A57;

      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 6px;

      a {
        font-weight: 700;
        font-size: 14px;
        line-height: 15px;
      }
    }
}
</style>
<template>
  <svg
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    :class="localSelected ? 'selected' : 'not-selected'"
  >
    <path
      style="fill:var(--active-fill); stroke:var(--active-stroke);"
      d="M4.63685 13.4289L11.4583 19.5166C11.6553 19.6924 11.7538 19.7803 11.8658 19.8115C11.9536 19.836 12.0464 19.836 12.1342 19.8115C12.2462 19.7803 12.3447 19.6924 12.5417 19.5166L19.3632 13.4289C21.397 11.6139 21.6409 8.51923 19.9166 6.40794L19.7466 6.19973C17.7516 3.75702 13.902 4.18079 12.4862 6.99897C12.2853 7.39874 11.7147 7.39873 11.5138 6.99897C10.098 4.18079 6.24835 3.75702 4.25339 6.19973L4.08335 6.40794C2.35906 8.51924 2.60303 11.6139 4.63685 13.4289Z"
      stroke-width="2"
    />
  </svg>
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";

const props = defineProps({
  isSelected: {type: Boolean, required: true}
})

const localSelected = ref(props.isSelected);

watch(() => props.isSelected, (newValue) => {
  console.log('it changed!')
  localSelected.value = newValue;
})

</script>

<style lang="scss" scoped>
.not-selected {
  path {
    --active-stroke: #577399;
    --active-fill: #fff;
    transition: fill 0.25s, stroke 0.25s;

    &:hover {
      --active-stroke: var(--secondary);
      --active-fill: white;
    }
  }
}

.selected {
  path {
    transition: fill 0.25s, stroke 0.25s;
    --active-stroke: var(--secondary);
    --active-fill: var(--secondary);
  }
}
</style>
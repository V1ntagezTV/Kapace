<template>
  <button :class="{'v2-base__button': buttonType === 1}">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  buttonType: {
    type: Number,
    default: 1
  }
})
</script>

<style lang="scss" scoped>
.v2-base {
  &__button {
    width: 100%;
    height: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    border-width: 0;
    border-radius: 4px;

    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    color: var(--dark-primary);
    -webkit-user-select: none;
    background: none;
  }
}
</style>
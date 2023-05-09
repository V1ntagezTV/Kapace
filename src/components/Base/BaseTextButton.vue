<template>
  <a class="text-button__text">
    <slot />
  </a>
</template>

<script lang="ts" setup>
</script>

<style scoped lang="scss">
.text-button {
  &__text {
    color: var(--dark-primary);
    transition: color 0.25s;

    &:hover {
      color: var(--primary);
      cursor: pointer;
    }
  }
}
</style>
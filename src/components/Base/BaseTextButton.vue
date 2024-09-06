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
    padding: 10px 12px;
    color: var(--primary40);
    transition: color 0.25s;

    &:hover {
      background: rgba(82, 90, 146, 0.08);
      cursor: pointer;
    }
  }
}
</style>
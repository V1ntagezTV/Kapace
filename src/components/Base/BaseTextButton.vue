<template>
  <a class="text-button__text">
    <slot />
  </a>
</template>

<style scoped lang="scss">
.text-button {
  &__text {
    color: var(--primary40);
    transition: color 0.25s;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
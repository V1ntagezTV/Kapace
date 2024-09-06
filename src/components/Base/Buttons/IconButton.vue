<template>
  <div class="icon-button__box">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.icon-button__box {
  display: flex;
  height: 40px;
  width: 40px;
  min-height: 40px;
  min-width: 40px;

  align-items: center;
  justify-content: center;

  border-radius: 100px;

  &:hover {
    cursor: pointer;
    background: var(--surface-container-highest90);
  }
}
</style>
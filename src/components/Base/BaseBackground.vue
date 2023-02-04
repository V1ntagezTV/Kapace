<template>
  <div class="base-background">
    <slot />
  </div>
</template>

<style lang="scss">
.base-background {
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    overflow: hidden;
}

</style>
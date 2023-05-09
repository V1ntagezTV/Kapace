<template>
  <div class="drop-menu__main">
    <slot name="header" :onClick="onClick" />
    <slot
      v-if="isActive"
      name="menu"
      :onClick="onDragLeave"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";

let isActive = ref(false);

function onClick() {
  isActive.value = !isActive.value;
}

function onDragLeave() {
  isActive.value = false;
}
</script>

<style lang="scss" scoped>
.drop-menu {
  &__main {
    height: 100%;
    position: relative;
  }

  &__button {
    height: 100%;
  }
}
</style>
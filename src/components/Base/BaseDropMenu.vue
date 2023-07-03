<template>
  <div class="drop-menu__box">
    <slot
      name="header"
      :onClick="onClick"
    />
    <slot
      v-if="isActive"
      class="drop-menu__menu"
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
  &__box {
    height: 100%;
    position: relative;
  }

  &__menu {
    position: absolute;
    left: 0;
    top: 0;
  }

  &__button {
    height: 100%;
  }
}
</style>
<template>
  <div
    ref="parent"
    class="drop-menu__box"
    :style="{ height: height }"
  >
    <slot
      ref="child"
      name="header"
      class="drop-menu__button"
      :onClick="onDropClick"
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

const isActive = ref(false);

defineProps({
  height: {type: String, required: true}
});

function onDropClick() {
  isActive.value = !isActive.value;
}

function onDragLeave() {
  isActive.value = false;
}
</script>

<style lang="scss" scoped>
.drop-menu {
  &__box {
    display: flex;
    position: relative;
  }

  &__menu {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
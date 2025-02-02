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
    <div
      v-if="isActive"
      class="drop-menu__menu"
      :class="{'drop-menu__menu-right': menuAlign === 'right'}"
      @click="onDragLeave"
    >
      <slot name="menu" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const isActive = ref(false);

defineProps({
  height: {type: String, required: false, default: 'auto'},
  menuAlign: {
    type: String,
    required: false,
    default: 'right',
    validator(value: string): boolean {
      return ['left', 'right'].some(x => x === value);
    }}
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
    flex-direction: column;
    position: relative;
  }

  &__menu {
    position: absolute;
    top: 100%;

    &-right {
      right: 0;
    }
  }
}
</style>
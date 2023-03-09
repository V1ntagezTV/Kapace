<template>
  <div class="drop-menu__main">
    <BaseButton
      :button-type="3"
      class="drop-menu__button"
      @click="onClick"
    >
      Action
    </BaseButton>

    <BaseBackground
      v-if="isActive"
      :type="3"
      class="drop-menu__menu"
      @click="onDragLeave"
      @focusout="onDragLeave"
    >
      <slot />
    </BaseBackground>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";

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

  &__menu {
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 10px 0;
    z-index: 999;
    position: absolute;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    right: 0;
  }

  &__button {
    height: 100%;
  }
}
</style>
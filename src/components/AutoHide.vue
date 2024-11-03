<template>
  <div
    v-show="isVisible"
    class="auto-hide__message" :class="{ 'auto-hide__fade-out': isFading }"
    @click.stop="showDivTemporarily"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
    @mousedown="showDivTemporarily"
    @mouseover="mouseEnter"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const isVisible = ref(true);
const isFading = ref(false);
let isMouseInside = false;
function showDivTemporarily() {
  isVisible.value = true;

  setTimeout(() => {
    if (isMouseInside) {
      return;
    }

    isFading.value = true;
    setTimeout(() => {
      isVisible.value = false;
      isFading.value = false;
    }, 1000);
  }, 2000);
}

function mouseEnter() {
  console.log('mouseEnter')
  isMouseInside = true;
  isVisible.value = true;
  isFading.value = false;
}

function mouseLeave() {
  console.log('mouseLeave')
  isMouseInside = false;
  showDivTemporarily();
}

showDivTemporarily();
</script>

<style lang="scss" scoped>
.auto-hide {
  &__message {
    opacity: 1;
    transition: opacity 1s ease-out; /* Set a 2-second fade-out transition */
  }

  &__fade-out {
    opacity: 0; /* Gradually reduce opacity to 0 */
  }
}
</style>
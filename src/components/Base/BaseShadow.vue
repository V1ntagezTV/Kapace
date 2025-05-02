<template>
  <div class="shadow-1" />
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.shadow-1 {
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  opacity: 0.2;
  z-index: -1;
}
</style>
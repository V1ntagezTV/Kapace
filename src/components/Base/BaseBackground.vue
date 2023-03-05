<template>
  <div v-if="props.type === 1" class="base-background__default">
    <slot />
  </div>

  <div v-else-if="props.type === 2" class="base-background__secondary">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';

const props = defineProps({
  type: {type: Number, default: 1, required: false}
});

</script>

<style lang="scss">
.base-background__default {
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    overflow: hidden;
}

.base-background__secondary {
  background: #FFFFFF;
  border-radius: 6px;
  overflow: hidden;
}



</style>
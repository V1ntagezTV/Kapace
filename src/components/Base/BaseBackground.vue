<template>
  <div v-if="props.type === 1" class="base-background__default">
    <slot />
  </div>

  <div v-else-if="props.type === 2" class="base-background__secondary">
    <slot />
  </div>

  <div v-else-if="props.type === 3" class="base-background__bordered">
    <slot />
  </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  type: {type: Number, default: 1, required: false}
});

</script>

<style lang="scss">
.base-background__default {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
}

.base-background__secondary {
  background: #FFFFFF;
  border-radius: 16px;
}

.base-background__bordered {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid var(--font-gray-v1);
}

.box {
  &__inline {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: min-content;
    grid-auto-flow: column;

    width: fit-content;
    height: fit-content;
  }
}
</style>
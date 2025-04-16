<template>
  <button class="filter-chips__box">
    <div v-if="enableTextIcon" class="filter-chips__icon">
      <slot name="text-icon" />
    </div>
    <p class="filter-chips__text">
      {{ text }}
    </p>
    <div v-if="enableMenuIcon" :class="{'filter-chips__icon': enableMenuIcon}">
      <slot name="menu-icon" />
    </div>
  </button>
</template>

<script lang="ts" setup>
defineProps({
  text: {type: String, required: true},
  enableTextIcon: {type: Boolean, required: false, default: false},
  enableMenuIcon: {type: Boolean, required: false, default: false},
});
</script>

<style lang="scss" scoped>
.filter-chips {
  &__box {
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-template-rows: 32px;
    width: min-content;
    justify-content: center;
    align-items: center;

    margin: 0;
    padding: 0 8px;

    border-radius: 8px;
    color: #38383C;
    cursor: pointer;
  }

  &__text {
    font-weight: 500;
    font-size: 14px;
    line-height: 143%;
    letter-spacing: 0.04em;
    text-align: center;
    white-space: nowrap;
    color: currentColor;

    padding: 0 8px 0 8px;
    margin: 0;
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    width: 24px;
  }
}
</style>
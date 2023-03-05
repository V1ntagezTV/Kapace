<template>
  <button v-if="buttonType === 1" class="base-button__button base-button__light">
    <slot />
  </button>

  <button v-else-if="buttonType === 2" class="base-button__button base-button__dark">
    <slot />
  </button>
  
  <button v-else-if="buttonType === 3" class="base-button__button base-button__text">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  buttonType: {
    type: Number,
    default: 1
  }
})
</script>

<style lang="scss">
.base-button {
  &__button {
    width: 100%;
    height: fit-content;
    padding: 12px;
    display: flex;
    justify-content: center;
    background: transparent;
    align-items: center;
    border-width: 0;
    border-radius: 4px;

    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.07em;
    font-size: 14px;
    line-height: 17px;
    color: var(--dark-primary);
    -webkit-user-select: none;
  }

  &__light {
    background: white;
    color: var(--dark-primary);
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    transition: border 0.25s;

    &:hover {
      border: 1.5px solid #93B0D9;
      cursor: pointer;
    }
  }

  &__dark {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    background: #576999;
    color: white;
    transition: background-color 0.25s, color 0.25s;

    &:hover {
      cursor: pointer;
      background: #6686B3;
    }
  }

  &__text {
    font-size: 14px;
    color: #969BAB;
    border: none;
    background: none;
    text-decoration: none;

    transition: color 0.25s;

    &:hover {
      color: var(--primary);
      cursor: pointer;
    }
  }
}
</style>
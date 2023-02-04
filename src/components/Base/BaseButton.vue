<template>
  <button v-if="buttonType === 1" class="base-button__button base-button__default">
    <slot />
  </button>

  <button v-else-if="buttonType === 2" class="base-button__button base-button__secondary">
    <slot />
  </button>
  
  <button v-else-if="buttonType === 3" class="base-button__button base-button__text">
    <slot />
  </button>
</template>

<script>
export default {
  name: "BaseButton",
  props: {
    buttonType: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style lang="scss">
.base-button {
  &__button {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    background: transparent;
    align-items: center;
    border-width: 0;
    border-radius: 4px;
    padding: 0;

    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.04em;
    font-size: 15px;
    line-height: 17px;
    color: var(--dark-primary);
    -webkit-user-select: none;
  }

  &__default {
    background: var(--white);
    color: var(--font-gray);
    border: 1px solid #d9d9d9;
    border-radius: 6px;

    &:hover {
      background: #EEEFF4;
      cursor: pointer;
    }
  }

  &__secondary {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    background: linear-gradient(180deg, #577399 0%, #576999 100%);
    color: #FFFFFF;

    &:hover {
      cursor: pointer;
      background: linear-gradient(180deg, #6686B3 0%, #576999 100%);
    }
  }

  &__text {
    width: auto;
    padding: 0 8px;
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 15px;
    letter-spacing: 0.04em;
    color: #969BAB;

    border: none;
    background: none;
    text-decoration: none;

    &:hover {
      color: var(--primary);
      cursor: pointer;
    }
  }
}
</style>
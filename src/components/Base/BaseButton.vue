<template>
  <button v-if="buttonType === 1 && variant === 'skip'" class="label-large base-button__button base-button__light">
    <slot />
  </button>

  <button v-else-if="buttonType === 2 && variant === 'skip'" class="label-large base-button__button base-button__dark">
    <slot />
  </button>

  <button v-else-if="buttonType === 3 && variant === 'skip'" class="label-large base-button__button base-button__text">
    <slot />
  </button>

  <button v-else-if="variant === 'filled'" class="label-large base-button__button base-button__filled">
    <slot />
  </button>

  <button v-else-if="variant === 'outline'" class="label-large base-button__button base-button__outline">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  buttonType: {
    type: Number,
    default: 1
  },
  variant: {
    type: String,
    default: 'skip',
    validator(value: string): boolean {
      return ['skip', 'filled', 'outline'].some(x => x === value);
    }
  }
})
</script>

<style lang="scss">
.base-button {
  &__button {
    height: 46px;
    padding: 12px 24px;
    display: flex;
    justify-content: center;
    background: transparent;
    align-items: center;

    -webkit-user-select: none;
    cursor: pointer;
    transition: color 0.25s, background-color 0.25s, border 0.25s;;
  }

  &__light {
    color: white;

    &:hover {
      border: 1.5px solid rgba(0, 0, 0, 0.3);
    }
  }

  &__dark {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    background: #576999;

    &:hover {
      background: #6686B3;
    }

    * {
      color: white;
    }
  }

  &__text {
    font-size: 14px;
    color: var(--font-gray-v4);
    border: none;
    background: none;
    text-decoration: none;

    transition: color 0.25s;

    &:hover {
      color: var(--primary);
    }
  }

  &__filled {
    color: white;
    background: var(--primary40);

    a {
      color: white;
    }

    &:hover {
      background: var(--primary50);
    }

    &:active {
      background: var(--primary60);
    }
  }

  &__outline {
    color: var(--primary40);
    background-color: white;

    a {
      color: var(--primary40);
    }

    &:hover {
      background-color: color-mix(in srgb, var(--primary40) 8%, transparent);
    }

    &:active {
      background-color: color-mix(in srgb, var(--primary40) 12%, transparent);
      border-color: var(--primary40);
    }
  }
}
</style>
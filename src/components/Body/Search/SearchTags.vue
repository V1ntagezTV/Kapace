<template>
  <div class="search-tags">
    <BaseBackground
      v-for="value in values"
      :key="value"
      class="search-tags__container"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="8" cy="8"
          r="7" fill="#FF776F"
        />
        <path
          d="M5 5L11 11" stroke="white"
          stroke-width="1.2" stroke-linecap="round"
        />
        <path
          d="M11 5L5 11" stroke="white"
          stroke-width="1.2" stroke-linecap="round"
        />
      </svg>

      <a>{{ value }}</a>
    </BaseBackground>
  </div>
</template>

<script>
import BaseBackground from '../../Base/BaseBackground.vue';

export default {
  name: 'App',
  components: {
    BaseBackground
  },
  props: {
    values: {
      type: Array,
    }
  }
}
</script>

<style lang="scss">
.search-tags {
  height: fit-content;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0;
  gap: 10px;

  &__container {
    height: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    gap: 4px;

    font-family: 'Inter',serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 12px;
    text-align: justify;
    letter-spacing: 0.04em;
  }
}
</style>
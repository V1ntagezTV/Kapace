<template>
  <div class="search-component__container">
    <BaseBackground class="search-component__search">
      <input
        class="search-component__input" placeholder="Поиск по сайту"
        type="search"
      >
      <div class="search-component__splitter" />
      <button class="search-component__search-button">
        <svg
          width="24" height="24"
          viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="11" cy="11"
            r="7" stroke="#969BAB"
            stroke-width="2"
          />
          <path
            d="M20 20L16 16" stroke="#969BAB"
            stroke-width="2" stroke-linecap="round"
          />
        </svg>
      </button>
    </BaseBackground>
  </div>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
</script>

<style lang="scss">

.search-component {

    &__container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 0px;
        gap: 15px;
    
        width: 100%;
        height: 40px;
    
        flex: none;
        order: 0;
        align-self: stretch;
        flex-grow: 0;

        & p {
            margin: 0;
        }

        &:hover {
            border-color: #474A57;
            border-width: 1px;
        }
    }
 
    &__search {
        outline: none;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0px 20px;
        gap: 12px;

        width: 100%;
        height: 100%;

        align-self: stretch;

        &:focus-within {
            border: thin solid #577399;
        }
    }

    &__input {
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 15px;
        display: flex;
        align-items: center;
        text-align: justify;
        letter-spacing: 0.04em;
        height: 100%;
        width: 100%;
        color: #474A57;
        text-decoration: 0;
        border-radius: 0;
        border-color: transparent;
        border-width: 0; 
        outline: none;
        padding: 0;

        &::placeholder {
            text-decoration: 0;
            border-width: 0; 
            border-radius: 0;
            border-color: transparent;
            color: #969BAB;
        }
    }

    &__splitter {
        width: 22px;
        height: 0px;

        border: 1px solid #F7F7FF;
        transform: rotate(90deg);
    }

    &__search-button {
        width: 40px;
        height: 100%;
        background: none;
        text-decoration: 0;
        border-radius: 0;
        border-color: transparent;
        border-width: 0; 
        outline: none;
        padding: 0;

        :hover {

        }
    }

    &__filter-container {
        height: 100%;
        padding: 0 15px;
        color: #474A57;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 6px;

        a {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 700;
            font-size: 14px;
            line-height: 15px;
        }
    }
}
</style>
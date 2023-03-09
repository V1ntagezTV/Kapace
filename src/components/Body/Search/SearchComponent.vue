<template>
  <BaseBackground :type="3" class="search-component__container search-component__search ">
    <input
      class="search-component__input"
      placeholder="Поиск по сайту"
      type="search"
    >
    <div class="search-component__splitter" />
    <button class="search-component__search-button">
      <LoopIcon />
    </button>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import LoopIcon from "@/components/Icons/LoopIcon.vue";
</script>

<style lang="scss">

.search-component {
  &__search {
    outline: none;
    display: flex;
    flex-direction: row;
    align-items: center;

    width: 100%;
    height: 40px;

    align-self: stretch;
    transition: border-left-color 0.25s, border-right-color 0.25s, border-top-color 0.25s, border-bottom-color 0.25s;

    &:hover {
      border-color: var(--primary);
    }

    & p {
      margin: 0;
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
    width: inherit;
    color: #474A57;
    border-radius: 0;
    border-color: transparent;
    border-width: 0;
    outline: none;
    padding: 0 20px;

    &::placeholder {
      text-decoration: 0;
      border-width: 0;
      border-radius: 0;
      border-color: transparent;
      color: #969BAB;
    }
  }

    &__splitter {
      width: 1px;
      height: 100%;
      border: 1px solid #F7F7FF;
    }

    &__search-button {
      width: 70px;
      height: 100%;
      text-decoration: 0;
      border-radius: 0;
      border-color: transparent;
      border-width: 0;
      padding: 0;
      background-color: #576999;
      color: white;
      transition: background-color 0.25s, color 0.25s;

      &:hover {
        background-color: #6686B3;
        color: white;
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
        font-weight: 700;
        font-size: 14px;
        line-height: 15px;
      }
    }
}
</style>
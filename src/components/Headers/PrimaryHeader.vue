<template>
  <div class="primary-header__main">
    <router-link class="row" to="/">
      <img
        class="primary-header__logo"
        src="@/assets/images/Logo.svg"
        alt="Главная"
      >
    </router-link>

    <router-link to="/edit">
      <button class="material primary-header__button">
        РЕДАКТОР
      </button>
    </router-link>

    <nav class="row gap-16">
      <router-link to="/">
        <base-text-button class="secondary-header__text-button m-radius-circle">
          Главная
        </base-text-button>
      </router-link>
      <router-link to="/search">
        <base-text-button class="secondary-header__text-button m-radius-circle">
          Поиск
        </base-text-button>
      </router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.primary-header {
  &__main {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    gap: 20px;
  }

  &__button {
    font-size: 10px;
    font-weight: 500;
    color: white;
    height: 22px;

    border: 1px solid white;
    border-radius: 4px;
    transition: border 0.25s, color 0.25s;

    padding: 0 8px;

    &:hover {
      cursor: pointer;
      border: 1px solid var(--font-gray-v1);
      color: var(--font-gray-v1);
    }

  }

  &__logo {
    height: 22px;
    background: #FFFFFF;
  }
}
.secondary-header {
  &__main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
  }

  &__text-button {
    display: flex;
    color: white;
    padding: 10px 12px;
    cursor: pointer;
    &:hover {
      color: var(--font-gray-v1);
      background: #21222A;
    }

    &:focus {
      border: 1px solid white;
      color: var(--font-gray-v1);
      background: #272834;
    }
  }
}
</style>
<script lang="ts" setup>
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
</script>
<template>
  <div class="secondary-header__main">
    <nav class="secondary-header__nav">
      <router-link to="/">
        <BaseTextButton class="secondary-header__text-button">
          Главная
        </BaseTextButton>
      </router-link>
      <router-link to="/search">
        <BaseTextButton class="secondary-header__text-button">
          Поиск
        </BaseTextButton>
      </router-link>
      <BaseTextButton class="secondary-header__text-button">
        Популярное
      </BaseTextButton>
      <BaseTextButton class="secondary-header__text-button">
        Категории
      </BaseTextButton>
      <BaseTextButton class="secondary-header__text-button">
        По жанрам
      </BaseTextButton>
    </nav>

    <UnauthorizedUserComponent class="nav-main" />
  </div>
</template>

<script>
import UnauthorizedUserComponent from "./UnauthorizedUserComponent.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";

export default {
name: 'App',
components: {
  BaseTextButton,
    UnauthorizedUserComponent
  },
}
</script>

<style lang="scss" scoped>

.secondary-header {
  &__main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
    background: white;
  }

  &__nav {
    color: var(--header-static-text);
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 20px;

    & a {
      align-items: center;
      height: 100%;
      display: flex;
      font-weight: 600;
      font-size: 14px;

      & :hover {
        color: var(--header-hover-text);
        cursor: pointer;
      }
    }
  }

  &__text-button {
    color: var(--header-static-text);
  }
}
</style>
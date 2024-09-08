<template>
  <div class="primary-header__main">
    <router-link to="/">
      <img
        class="primary-header__logo"
        src="@/assets/images/Logo.svg"
        alt="Главная"
      >
    </router-link>

    <router-link to="/edits">
      <button class="material primary-header__button">
        РЕДАКТОР
      </button>
    </router-link>
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

    & a {
      color: white;
    }
  }

  &__logo {
    height: 22px;
    background: #FFFFFF;
  }
}


</style>
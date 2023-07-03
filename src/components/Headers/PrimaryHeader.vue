<template>
  <div class="primary-header__main">
    <router-link to="/">
      <img class="primary-header__logo" src="@/assets/images/Logo.svg" />
    </router-link>

    <router-link to="/edit/content">
      <button class="primary-header__button">
        BECOME AN EDITOR
      </button>
    </router-link>
    <button class="primary-header__button">
      WRITE AN UPDATE
    </button>
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
    letter-spacing: 0.1em;
    color: white;
    height: 22px;
    background: transparent;
    border: 1px solid white;
    border-radius: 4px;
    transition: border 0.25s, color 0.25s;

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
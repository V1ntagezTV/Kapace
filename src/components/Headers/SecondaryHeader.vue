<template>
  <div class="main">
    <nav class="nav-main some-component">
      <router-link to="/" active-class="nav-main">
        Главная
      </router-link>
      <router-link to="/search">
        Новинки
      </router-link>
      <a>Популярное</a>
      <a>Категории</a>
      <a>По жанрам</a>
      <router-link to="/profile">
        Профиль
      </router-link>
    </nav>

    <UnauthorizedUserComponent class="nav-main" />
  </div>
</template>

<script>
import UnauthorizedUserComponent from "./UnauthorizedUserComponent.vue";

export default {
name: 'App',
components: {
    UnauthorizedUserComponent
  },
}
</script>

<style>

.main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 42px;
    background: white;
}

nav a,
nav a.router-link-active,
nav a.router-link-exact-active {
    text-decoration: none;
    color: #9D9D9D;
}

.nav-main {
    color: #9D9D9D;
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 20px;
}

.nav-main a {
    align-items: center;
    height: 100%;
    font-style: normal;
    display: flex;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
}

.nav-main a:hover {
    color: #577399;
    cursor: pointer;
}
</style>
<template>
  <div v-if="!loggedIn" class="user-main">
    <router-link to="/login">
      Войти
    </router-link>
    <router-link to="/reg">
      Регистрация
    </router-link>
  </div>

  <div v-else class="user-main">
    <router-link to="/profile">
      Профиль
    </router-link>
    <a @click="LogOut">Выйти</a>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState({
        loggedIn: state => state.loggedIn,
    })
  },
  methods: {
    ...mapMutations([
        'LogOut'
    ]),
  }
}
</script>

<style lang="scss" scoped>
.user-main {
    display: flex;
    height: 100%;
    color: #38383C;
    flex-direction: row;
    align-items: end;
    gap: 20px;

  & a {
    align-items: center;
    height: 100%;
    font-style: normal;
    display: flex;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;

    &:hover {
      color: var(--header-hover-text);
      cursor: pointer;
    }
  }
}
</style>
<template>
  <div v-if="!loggedIn" class="user-main">
    <router-link to="/login">
      Войти
    </router-link>
    <router-link to="/reg">
      Регистрация
    </router-link>
  </div>

  <div v-else>
    <a @click="LogOut">Уже профиль</a>
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

<style>
  .user-main {
      display: flex;
      height: 42px;
      color: #38383C;
      flex-direction: row;
      align-items: end;
      gap: 20px;
}
</style>
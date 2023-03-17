<template>
  <div v-if="!loggedIn" class="user-main__main">
    <router-link to="/login">
      Войти
    </router-link>
    <router-link to="/reg">
      Регистрация
    </router-link>
  </div>

  <div v-else class="user-main__main">
    <BaseDropMenu>
      <router-link class="user-main__menu-item" to="/profile">
        <UserIcon class="user-main__icon" />
        Профиль
      </router-link>

      <router-link
        to="/"
        class="user-main__menu-item user-main__menu-item-exit"
        @click="LogOut"
      >
        <LogOutIcon class="user-main__icon" />
        Выйти
      </router-link>
    </BaseDropMenu>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import BaseDropMenu from "@/components/Base/BaseDropMenu.vue";
import UserIcon from "@/components/Icons/UserIcon.vue";
import LogOutIcon from "@/components/Icons/LogOutIcon.vue";

export default {
  name: 'App',
  components: {LogOutIcon, UserIcon, BaseDropMenu},
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
  &__main {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #38383C;
    gap: 20px;

    & a {
      align-items: center;
      display: flex;
      font-weight: 600;
      font-size: 14px;
      color: var(--header-static-text);
      transition: color 0.25s;

      &:hover {
        color: var(--header-hover-text);
        cursor: pointer;
      }
    }
  }

  &__menu-item {
    height: 36px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    gap: 12px;
    padding: 0 15px;

    color: var(--font-gray-v4);
    transition: color 0.25s;

    &:hover {
      color: var(--primary);
      cursor: pointer;
      background: #F4F5F7;
    }
  }

  &__menu-item-exit {
    &:hover {
      color: #ff3838;
      cursor: pointer;
      background: #F4F5F7;
    }
  }

  &__icons {
    color: var(--font-gray-v4);
    transition: color 0.25s;

    &:hover {
      color: var(--primary);
    }
  }
}
</style>
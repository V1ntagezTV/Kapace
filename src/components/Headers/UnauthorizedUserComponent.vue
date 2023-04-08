<template>
  <div v-if="!loggedIn" class="user-main__header">
    <router-link class="user-main__header-button" to="/login">
      Войти
    </router-link>
    <router-link class="user-main__header-button" to="/reg">
      Регистрация
    </router-link>
  </div>

  <div v-else>
    <BaseDropMenu>
      <template #header class="user-main__main">
        Профиль
        <drop-arrow />
      </template>

      <template #menu>
        <router-link class="user-main__menu-item" to="/profile">
          <UserIcon />
          Профиль
        </router-link>
        <router-link
          to="/"
          class="user-main__menu-item user-main__menu-item-exit"
          @click="LogOut"
        >
          <LogOutIcon />
          Выйти
        </router-link>
      </template>
    </BaseDropMenu>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import BaseDropMenu from "@/components/Base/BaseDropMenu.vue";
import UserIcon from "@/components/Icons/UserIcon.vue";
import LogOutIcon from "@/components/Icons/LogOutIcon.vue";
import DropArrow from "@/components/Icons/DropArrow.vue";

export default {
  name: 'App',
  components: {DropArrow, LogOutIcon, UserIcon, BaseDropMenu},
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
  &__header {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  &__header-button {
    display: flex;
    align-items: center;
    color: var(--header-static-text);
    transition: color 0.25s;

    &:hover {
      color: var(--header-hover-text);
      cursor: pointer;
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
}
</style>
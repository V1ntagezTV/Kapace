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
      <template #header="{ onClick }">
        <BaseButton
          class="user-main__menu-button"
          :button-type="3"
          @click="onClick"
        >
          Профиль
          <drop-arrow />
        </BaseButton>
      </template>

      <template #menu="{ onClick }">
        <BaseBackground
          class="user-main__menu"
          :type="3"
          @click="onClick"
        >
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
        </BaseBackground>
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
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";

export default {
  name: 'App',
  components: {BaseBackground, BaseButton, DropArrow, LogOutIcon, UserIcon, BaseDropMenu},
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

  &__menu-button {
    display: flex;
    gap: 6px;
    height: 100%;
    padding: 0;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    width: 270px;
    padding: 10px 0;
    z-index: 999;
    position: absolute;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    right: 0;
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
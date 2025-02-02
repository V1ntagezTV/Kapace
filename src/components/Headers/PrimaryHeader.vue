<template>
  <div style="height: 56px" class="row h__space-between v__center">
    <nav class="row gap-16 v__center">
      <router-link class="row v__center" to="/">
        <img
          class="header__logo"
          src="@/assets/images/Logo.svg"
          alt="Главная"
        >
      </router-link>
      <router-link class="header__edit body-small header__text-button m-radius-circle m-border v__center" to="/edit">
        Редактор
      </router-link>
      <router-link to="/" class="header__text-button m-radius-circle">
        Главная
      </router-link>
      <router-link to="/search" class="header__text-button m-radius-circle">
        Поиск
      </router-link>
    </nav>

    <div class="row gap-16 v__center">
      <div v-if="!store.$state.loggedIn" class="row gap-16">
        <router-link to="/login">
          <base-text-button class="header__text-button m-radius-circle">
            Войти
          </base-text-button>
        </router-link>
        <router-link to="/reg">
          <base-text-button class="header__text-button m-radius-circle">
            Регистрация
          </base-text-button>
        </router-link>
      </div>

      <div v-else class="row gap-8">
        <base-drop-menu class="header__user gap-16">
          <template #header="{ onClick }">
            <base-button
              class="header__text-button gap-8 v__center m-radius-circle"
              :button-type="3"
              @click="onClick"
            >
              Профиль
              <material-drop-arrow />
            </base-button>
          </template>

          <template #menu="{ onClick }">
            <base-background class="header__menu m-radius-1 column v__start h__center" @click="onClick">
              <a class="header__menu-button row gap-8 v__center h__start">
                <user-icon />
                Профиль (in dev)
              </a>
              <router-link
                class="header__menu-button row gap-8 v__center h__start"
                to="/"
                @click="store.LogOut"
              >
                <log-out-icon />
                Выйти
              </router-link>
            </base-background>
          </template>
        </base-drop-menu>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import BaseDropMenu from "@/components/Base/BaseDropMenu.vue";
import UserIcon from "@/components/Icons/UserIcon.vue";
import LogOutIcon from "@/components/Icons/LogOutIcon.vue";
import {userStore} from "@/store/UserStore";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";

const store = userStore();
</script>

<style lang="scss" scoped>
.header {
  &__user {
    position: relative;
  }

  &__menu {
    display: grid;
    width: 200px;
    grid-auto-columns: 1fr;
    grid-auto-flow: row;
    position: absolute;
    left: -200px;

    overflow: hidden;

    &-button {
      display: flex;
      padding: 0 16px;
      height: 40px;

      &:hover {
        background: var(--surface-container-highest90);
      }
    }
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

  &__edit {
    height: fit-content;
  }

  &__text-button {
    display: flex;
    color: white;
    padding: 10px 12px;

    &:hover {
      color: var(--font-gray-v1);
      background: #21222A;
    }
  }
}
</style>
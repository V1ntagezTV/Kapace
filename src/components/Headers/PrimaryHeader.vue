<template>
  <div style="height: 56px" class="row h__space-between v__center">
    <nav v-show="isMobile" class="row gap-16 v__center">
      <base-selector
        :model-value="selectedMenu"
        :selectable-values="menuValues"
        :title="'Меню'"
        :menu-alignment="MenuAlignment.Left"
        :is-dropped="isHeadersMenuDropped"
        @update:modelValue="selectMenuHandler"
      >
        <template #header>
          <base-button
            style="background-color: #303036;"
            class="m-radius-circle m-border gap-16"
            @click="() => { isHeadersMenuDropped = !isHeadersMenuDropped }"
          >
            <menu-icon />
            Меню
          </base-button>
        </template>
      </base-selector>
      <router-link class="row v__center" to="/">
        <img
          class="header__logo"
          src="@/assets/images/Logo.svg"
          alt="Главная"
        >
      </router-link>
    </nav>

    <nav
      v-show="!isMobile"
      class="row gap-16 v__center"
    >
      <router-link class="row v__center" to="/">
        <img
          class="header__logo"
          src="@/assets/images/Logo.svg"
          alt="Главная"
        >
      </router-link>
      <router-link to="/edit" class="header__text-button body-small m-radius-circle m-border v__center">
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
              {{ store.nickname }}
              <material-drop-arrow />
            </base-button>
          </template>

          <template #menu="{ onClick }">
            <base-background class="header__menu m-radius-1 column v__start h__center" @click="onClick">
              <router-link to="/profile" class="header__menu-button row gap-8 v__center h__start">
                <user-icon />
                Профиль
              </router-link>
              <router-link to="settings" class="header__menu-button row gap-8 v__center h__start">
                <details-icon />
                Настройки
              </router-link>
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
import DetailsIcon from "@/components/Icons/DetailsIcon.vue";
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import MenuIcon from "@/components/Icons/MenuIcon.vue";
import {useRouter} from "vue-router";

const store = userStore();
const router = useRouter();
const isHeadersMenuDropped = ref(false);
const selectedMenu = ref("")
const menuValues = ['Главная', 'Редактор', 'Поиск'];
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value <= 720)

const handleResize = () => {screenWidth.value = window.innerWidth}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function selectMenuHandler(value: string) {
  if (menuValues[0] === value) {
    router.push('/')
  } else if (menuValues[1] === value) {
    router.push('/edit')
  } else if (menuValues[2] === value) {
    router.push('/search')
  }

  isHeadersMenuDropped.value = false;
}




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
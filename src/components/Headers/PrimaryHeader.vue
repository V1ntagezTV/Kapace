<template>
  <div class="header row h__space-between v__center">
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
            class="header__mobile-menu-button m-radius-circle gap-8"
            @click="toggleHeadersMenu"
          >
            <menu-grid-icon class="header__icon" />
            <span class="header__mobile-menu-label">Меню</span>
          </base-button>
        </template>
      </base-selector>
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
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="header__text-button m-radius-circle v__center"
        :class="{ 'header__text-button-active': isRouteActive(item) }"
      >
        <component :is="item.icon" class="header__icon" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="row gap-16 v__center">
      <div v-if="!store.$state.loggedIn" class="row gap-16">
        <router-link v-if="isMobile" to="/login">
          <base-text-button
            class="header__auth-compact-button m-radius-circle"
            aria-label="Войти или зарегистрироваться"
            title="Войти или зарегистрироваться"
          >
            <user-icon class="header__icon" />
            <plus-icon class="header__icon" />
          </base-text-button>
        </router-link>
        <router-link v-else to="/login">
          <base-text-button class="header__text-button m-radius-circle">
            <user-icon class="header__icon" />
            Войти
          </base-text-button>
        </router-link>
        <router-link v-if="!isMobile" to="/reg">
          <base-text-button class="header__text-button m-radius-circle">
            <plus-icon class="header__icon" />
            Регистрация
          </base-text-button>
        </router-link>
      </div>

      <div v-else class="row gap-8">
        <base-drop-menu class="header__user gap-16">
          <template #header="{ onClick }">
            <button
              type="button"
              class="header__user-trigger header__text-button gap-8 v__center m-radius-circle"
              aria-label="Открыть меню пользователя"
              @click="onClick"
            >
              <img
                class="header__user-avatar"
                :src="userAvatarSrc"
                alt=""
              >
              {{ store.nickname }}
              <material-drop-arrow />
            </button>
          </template>

          <template #menu="{ onClick }">
            <base-background
              class="header__menu m-radius-1 column v__start h__center"
              @click="onClick"
            >
              <router-link to="/profile" class="header__menu-button row gap-8 v__center h__start">
                <user-icon />
                Профиль
              </router-link>
              <router-link to="/settings" class="header__menu-button row gap-8 v__center h__start">
                <settings-icon />
                Настройки
              </router-link>
              <button
                type="button"
                class="header__menu-button row gap-8 v__center h__start"
                @click="logout"
              >
                <log-out-icon />
                Выйти
              </button>
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
import {computed, ref, onMounted, onBeforeUnmount, inject, watch, type Component} from 'vue'
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import {useRoute, useRouter} from "vue-router";
import SettingsIcon from "@/components/Icons/SettingsIcon.vue";
import {UserApi} from "@/api/UserApi";
import AddNote from "@/components/Icons/AddNote.vue";
import LoopIcon from "@/components/Icons/LoopIcon.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import PlusIcon from "@/components/Icons/PlusIcon.vue";
import MenuGridIcon from "@/components/Icons/MenuGridIcon.vue";
import { resolveUserAvatarSrc } from "@/helpers/UserAvatarResolver";

const store = userStore();
const userAvatarSrc = computed(() => resolveUserAvatarSrc(store.imageUrl));
const router = useRouter();
const route = useRoute();
const userApi = inject<UserApi | null>('user-api', null);
const isHeadersMenuDropped = ref(false);
const selectedMenu = ref("");
const screenWidth = ref(window.innerWidth);
const isMobile = computed(() => screenWidth.value <= 720);

type HeaderNavItem = {
  label: string
  to: string
  icon: Component
  exact?: boolean
};

const navItems: HeaderNavItem[] = [
  {label: 'Главная', to: '/', icon: FolderIcon, exact: true},
  {label: 'Редактор', to: '/edit', icon: AddNote},
  {label: 'Поиск', to: '/search', icon: LoopIcon}
];

const menuValues = navItems.map((item) => item.label);

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(
  () => route.path,
  () => {
    selectedMenu.value = getSelectedMenuLabel();
    isHeadersMenuDropped.value = false;
  },
  {immediate: true}
);

function isRouteActive(item: HeaderNavItem): boolean {
  if (item.exact) {
    return route.path === item.to;
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`);
}

function getSelectedMenuLabel(): string {
  const activeItem = navItems.find((item) => isRouteActive(item));
  return activeItem?.label ?? navItems[0].label;
}

function toggleHeadersMenu() {
  isHeadersMenuDropped.value = !isHeadersMenuDropped.value;
}

function selectMenuHandler(value: string) {
  const selectedItem = navItems.find((item) => item.label === value);

  if (selectedItem && !isRouteActive(selectedItem)) {
    router.push(selectedItem.to);
  }

  isHeadersMenuDropped.value = false;
}

async function logout() {
  if (userApi) {
    await userApi.logout();
  }

  store.LogOut();

  if (route.name !== 'main') {
    await router.replace({ name: 'main' });
  }
}

</script>

<style lang="scss" scoped>
.header {
  height: 60px;

  &__user {
    position: relative;
  }

  &__user-trigger {
    border: none;
    background: transparent;
  }

  &__user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
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
      width: 100%;
      padding: 0 16px;
      height: 40px;
      color: inherit;
      text-align: left;
      cursor: pointer;

      &:hover {
        background: var(--surface-container-highest90);
      }
    }
  }

  &__mobile-menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    height: 32px;
    padding: 0 10px;
    font-size: 14px;
    line-height: 1;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      color: var(--font-gray-v1);
      cursor: pointer;
    }
  }

  &__mobile-menu-label {
    display: block;
    line-height: 1;
    transform: translateY(1px);
  }

  &__logo {
    height: 22px;
    background: #FFFFFF;
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__auth-compact-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: white;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;

    &:hover {
      cursor: pointer;
      border-color: rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      color: var(--font-gray-v1);
    }
  }

  &__text-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: white;
    padding: 10px 12px;
    transition: color 0.2s ease, background-color 0.2s ease;

    &-active {
      background: #21222A;
    }
    &:hover {
      color: var(--font-gray-v1);
      background: #21222A;
      cursor: pointer;
    }
  }
}
</style>
<template>
  <div class="header row h__space-between v__center">
    <nav v-show="isMobile" class="header__nav-selector row gap-16 v__center">
      <base-selector
        v-model:is-dropped="isHeadersMenuDropped"
        :model-value="selectedMenu"
        :selectable-values="menuValues"
        :title="'Меню'"
        :menu-alignment="MenuAlignment.Left"
        @update:model-value="selectMenuHandler"
      >
        <template #header="{ dropMenu }">
          <base-button
            class="header__mobile-menu-button m-radius-circle gap-8"
            @click="dropMenu(!isHeadersMenuDropped)"
          >
            <menu-grid-icon class="header__icon" />
            <span class="header__mobile-menu-label">Меню</span>
          </base-button>
        </template>
        <template #menu="{ select }">
          <button
            v-for="item in navItems"
            :key="item.to"
            type="button"
            class="header__mobile-nav-item body-large row gap-8 v__center h__start"
            @click.stop="select(item.label)"
          >
            <component :is="item.icon" class="header__icon" />
            {{ item.label }}
          </button>
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
        <base-selector
          v-model:is-dropped="isUserMenuDropped"
          model-value=""
          :selectable-values="[]"
          :menu-alignment="MenuAlignment.Right"
          class="header__user"
        >
          <template #header="{ dropMenu }">
            <button
              type="button"
              class="header__user-trigger header__text-button gap-8 v__center m-radius-circle"
              aria-label="Открыть меню пользователя"
              @click="dropMenu(!isUserMenuDropped)"
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

          <template #menu="{ close }">
            <router-link
              to="/profile"
              class="header__mobile-nav-item body-large row gap-8 v__center h__start"
              @click="close"
            >
              <user-icon class="header__icon" />
              Профиль
            </router-link>
            <router-link
              to="/settings"
              class="header__menu-item body-large row gap-8 v__center h__start"
              @click="close"
            >
              <settings-icon class="header__icon" />
              Настройки
            </router-link>
            <button
              type="button"
              class="header__menu-item body-large row gap-8 v__center h__start"
              @click="onLogoutClick(close)"
            >
              <log-out-icon class="header__icon" />
              Выйти
            </button>
          </template>
        </base-selector>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import UserIcon from "@/components/Icons/UserIcon.vue";
import LogOutIcon from "@/components/Icons/LogOutIcon.vue";
import {userStore} from "@/store/UserStore";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
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
const isUserMenuDropped = ref(false);
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
    isUserMenuDropped.value = false;
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

function selectMenuHandler(value: string) {
  const selectedItem = navItems.find((item) => item.label === value);

  if (selectedItem && !isRouteActive(selectedItem)) {
    router.push(selectedItem.to);
  }

  isHeadersMenuDropped.value = false;
}

async function onLogoutClick(close: () => void) {
  close();
  await logout();
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

  &__nav-selector,
  &__user {
    position: relative;

    :deep(.selector__box) {
      width: auto;
      height: auto;
    }
  }

  &__user {
    :deep(.selector__menu) {
      min-width: 200px;
      width: 200px;
      padding: 0;
      overflow: hidden;
    }
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

  &__menu-item,
  &__mobile-nav-item {
    display: flex;
    width: 100%;
    padding: 0 16px;
    height: 40px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    border: none;
    background: transparent;
    appearance: none;

    &:hover {
      background: var(--surface-container-highest90);
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

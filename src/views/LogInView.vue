<template>
  <div class="login-view__main">
    <BaseBackground class="login-view__container">
      <router-link to="/">
        <img
          class="login-view__logo" src="@/assets/images/Logo.svg"
          alt="Kapace logotype"
        >
      </router-link>

      <span class="title-large">Авторизация</span>

      <div class="login-view__input-container">
        <base-input
          v-model="loginInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isLoginInputInvalid"
          :place-holder="'Введите email'"
          type="email"
        />
        <base-input
          v-model="passwordInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isLoginInputInvalid"
          :place-holder="'Введите пароль'"
          type="password"
        />
      </div>

      <base-button
        class="m-radius-circle"
        :button-type="2"
        :variant="'filled'"
        @click.stop="logInClick"
      >
        Войти
      </base-button>

      <div class="login-view__links">
        <router-link to="/restore">
          Вспомнить пароль
        </router-link>
        <router-link to="/reg">
          Регистрация
        </router-link>
      </div>
    </BaseBackground>
  </div>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import {inject, ref} from "vue";
import {userStore} from "@/store/UserStore"
import {UserApi} from "@/api/UserApi";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import BaseInput from "@/components/Base/BaseInput.vue";
import {StringExtensions} from "@/helpers/StringExtensions";
import {useRouter} from "vue-router";

const router = useRouter()
const store = userStore();
const userApi = inject<UserApi>('user-api');
const eventStore = ClientEventStore();

const isLoginInputInvalid = ref<boolean>(false);
const isPasswordInputInvalid = ref<boolean>(false);
const loginInput = ref<string>(undefined);
const passwordInput = ref<string>(undefined);

async function logInClick() {
  if (IsInputsValid()) {
    try {
      await userApi.logIn(loginInput.value, passwordInput.value);
    } catch (exception) {
      eventStore.push('Ошибка! Не корректно введены логин или пароль!', EventTypes.Error);
      return;
    }

    const currentUser = await userApi.getCurrent();
    store.LogIn(currentUser.User.Nickname);
    await router.push('/');
  } else {
    eventStore.push('Введите логин и пароль для входа.', EventTypes.Error);
  }
}

function IsInputsValid() : boolean {
  if (StringExtensions.isNullOrEmpty(loginInput.value)) {
    isLoginInputInvalid.value = true;
  }

  if (StringExtensions.isNullOrEmpty(passwordInput.value)) {
    isPasswordInputInvalid.value = true;
  }

  return !isLoginInputInvalid.value && !isPasswordInputInvalid.value;
}
</script>

<style lang="scss" scoped>

.login-view {
  &__login-button {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    color: white;
    text-decoration: none;
  }

  &__memorize {
    display: flex;
    width: 100%;
  }

  &__memorize-label {
    margin-left: 4px;
    font-weight: 400;
    font-size: 14px;
    text-align: left;
    letter-spacing: 0.02em;
    cursor: pointer;
    -webkit-user-select: none;
  }

  &__line-breaker {
    width: 100%;
    height: 1px;
    background: #969BAB;
  }

  &__logo {
    height: 40px;
  }

  &__links {
    display: flex;
    flex-direction: row;
    font-size: 12px;
    gap: 16px;

    & a {
      color: var(--font-gray);
      text-decoration: underline;

      &:hover {
        cursor: pointer;
        color: #6686B3;
      }
    }
  }

  &__input {
    border: solid 1px #969BAB;
    border-radius: 6px;
    padding: 10px;
    height: 40px;
    width: 100%;

    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 15px;
    letter-spacing: 0.04em;
    color: #474A57;

    &:focus-visible {
      outline: var(--primary) auto 1px;;
    }
  }

  &__main {
    height: 100%;
    width: 100%;
    display: flex;
    margin-top: 26px;
    justify-content: center;
    align-items: center;
  }

  &__container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    height: fit-content;
    width: 420px;
    padding: 60px;
  }

  &__input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
}

</style>
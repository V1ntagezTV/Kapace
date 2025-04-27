<template>
  <div class="login-view__main">
    <BaseBackground :type="2" class="login-view__container gap-16">
      <p class="title-large">
        Авторизация
      </p>

      <div class="login-view__input-container gap-8 h__start">
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
          :type="isShowPassword ? 'text' : 'password'"
        >
          <template #end-icon>
            <icon-button @click.stop="() => isShowPassword = !isShowPassword">
              <eye-cross v-if="!StringExtensions.isNullOrEmpty(passwordInput) && !isShowPassword" :class="{'login-view__icon-active': isShowPassword, 'login-view__icon-static': !isShowPassword}" />
              <eye v-else-if="!StringExtensions.isNullOrEmpty(passwordInput) && isShowPassword" :class="{'login-view__icon-active': isShowPassword, 'login-view__icon-static': !isShowPassword}" />
            </icon-button>
          </template>
        </base-input>
      </div>

      <div class="row h__space-between">
        <base-text-button
          class="login-view__rememberMe row gap-8 h__space-between"
          @click="() => isRememberMe = !isRememberMe"
        >
          <input v-model="isRememberMe" type="checkbox">
          <div>
            Запомнить меня
          </div>
        </base-text-button>
        <base-text-button class="login-view__rememberMe">
          <router-link to="/restore">
            Забыли пароль?
          </router-link>
        </base-text-button>
      </div>

      <div class="column gap-16">
        <base-button
          class="m-radius-circle"
          :button-type="2"
          :variant="'filled'"
          @click.stop="logInClick"
        >
          Войти
        </base-button>
        <base-button :button-type="3" class="login-view__links m-border m-border-hover m-radius-circle column v__center gap-8">
          <router-link to="/reg">
            Зарегистрироваться
          </router-link>
        </base-button>
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
import Eye from "@/components/Icons/MaterialIcons/Eye.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";
import EyeCross from "@/components/Icons/EyeCross.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";

const router = useRouter();
const store = userStore();
const userApi = inject<UserApi>('user-api');
const eventStore = ClientEventStore();
const isShowPassword = ref<boolean>(false);
const isRememberMe = ref<boolean>(false);
const isLoginInputInvalid = ref<boolean>(false);
const isPasswordInputInvalid = ref<boolean>(false);
const loginInput = ref<string>(undefined);
const passwordInput = ref<string>(undefined);

async function logInClick() {
  const wrongInputErrorStr = 'Ошибка! Не корректно введены логин или пароль!';
  const defaultErrorStr = 'Ошибка сервера! Что-то пошло не так!';

  if (!IsInputsValid()) {
    eventStore.push(wrongInputErrorStr, EventTypes.Error as typeof EventTypes);
  }

  const response = await userApi.logIn(loginInput.value, passwordInput.value, isRememberMe.value);
  if (userApi.isErrorDetails(response)) {
    eventStore.push(wrongInputErrorStr, EventTypes.Error as typeof EventTypes);
    return;
  }

  if (response.status === 400) {
    eventStore.push(defaultErrorStr, EventTypes.Error as typeof EventTypes);
    return;
  }

  const userResponse = (await userApi.getCurrent())
    .onException(() => eventStore.push(defaultErrorStr, EventTypes.Error as typeof EventTypes))
    .onBusinessError(() => eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as typeof EventTypes));

  if (!userResponse.data) {
    eventStore.push(defaultErrorStr, EventTypes.Error as typeof EventTypes);
    return;
  }

  const currentUser = userResponse.data;

  store.LogIn(
    currentUser.User.Id,
    currentUser.User.Nickname,
    currentUser.User.Email,
    currentUser.User.ImageUrl,
    currentUser.Roles.map(x => x.Alias)
  );
  await router.push('/');
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
  &__rememberMe {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  &__icon-active {
    color: var(--primary40);
  }
  &__icon-static {
    color: var(--outline-light);
  }
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
    height: 30px;
  }

  &__links {
    & a {
      color: var(--primary40);

      &:hover {
        cursor: pointer;
        text-decoration: underline;
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
    height: fit-content;
    width: 420px;
    padding: 40px;
  }

  &__input-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    text-align: start;
  }
}

</style>
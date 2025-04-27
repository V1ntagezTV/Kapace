<template>
  <div class="registration-view__main">
    <BaseBackground
      :type="2"
      class="registration-view__container"
    >
      <p class="title-large">
        Регистрация
      </p>

      <div class="registration-view__input-container">
        <base-input
          v-model="nicknameInput"
          :mark-as-invalid-input="isNicknameInputInvalid"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :place-holder="'Придумайте никнейм'"
        />
        <base-input
          v-model="emailInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isEmailInputInvalid"
          :place-holder="'Введите email'"
          type="email"
        />
        <base-input
          v-model="firstPasswordInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isPasswordInputInvalid"
          :place-holder="'Введите пароль'"
          type="password"
        />
        <base-input
          v-model="secondPasswordInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isPasswordInputInvalid"
          :place-holder="'Подтвердите пароль'"
          type="password"
        />
      </div>

      <base-button
        class="m-radius-circle h__fill"
        :button-type="2"
        :variant="'filled'"
        @click="registrationButtonAction"
      >
        Зарегистрировать
      </base-button>

      <div class="registration-view__links">
        <router-link to="/login">
          Войти
        </router-link>
        <router-link to="/restore">
          Вспомнить пароль
        </router-link>
      </div>
    </BaseBackground>
    <email-verification-modal
      :is-visible="emailVerificationIsVisible"
      :current-email="emailInput"
      :user-token="authTempToken"
      @on:close="emailVerificationIsVisible = false;"
    />
  </div>
</template>

<script lang="ts" setup>
import {inject, ref} from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import {UserApi} from "@/api/UserApi";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {StringExtensions} from "@/helpers/StringExtensions";
import EmailVerificationModal from "@/components/Modal/EmailVerificationModal.vue";
import {useRouter} from "vue-router";

const userApi = inject<UserApi>('user-api');
const eventStore = ClientEventStore();
const router = useRouter();

const isNicknameInputInvalid = ref<boolean>(false);
const nicknameInput = ref<string>(undefined);

const isEmailInputInvalid = ref<boolean>(false);
const emailInput = ref<string>(undefined);

const isPasswordInputInvalid = ref<boolean>(false);
const firstPasswordInput = ref<string>(null);
const secondPasswordInput = ref<string>(null);

const emailVerificationIsVisible = ref<boolean>(false);
let authTempToken = ref<string|null>(null);

async function registrationButtonAction() {
  if (!StringExtensions.isNullOrEmpty(firstPasswordInput.value)) {
    if (firstPasswordInput.value.length < 10) {
      eventStore.push('Ошибка! Длина пароля должна быть НЕ меньше 10 символов.', EventTypes.Error);
      isPasswordInputInvalid.value = true;
    }
    else if (firstPasswordInput.value != secondPasswordInput.value) {
      eventStore.push('Ошибка! Введенные пароли не совпадают.', EventTypes.Error);
      isPasswordInputInvalid.value = true;
    } else {
      isPasswordInputInvalid.value = false;
    }
  } else {
    eventStore.push('Ошибка! Не заполнены обязательные поля.', EventTypes.Error);
    isPasswordInputInvalid.value = true;
  }

  if (!StringExtensions.validateEmail(emailInput.value)) {
    isEmailInputInvalid.value = true;
    eventStore.push('Ошибка! Не верный формат почты.', EventTypes.Error);
  } else {
    isEmailInputInvalid.value = false;
  }

  if (StringExtensions.isNullOrEmpty(nicknameInput.value)) {
    isNicknameInputInvalid.value = true;
    eventStore.push('Ошибка! Не заполнены обязательные поля.', EventTypes.Error);
  } else {
    if (nicknameInput.value.length < 5 && nicknameInput.value.length > 15) {
      isNicknameInputInvalid.value = true;
      eventStore.push('Ошибка! Длина никнейма должна быть от 5 до 15 символов.', EventTypes.Error);
    } else if (!StringExtensions.validateAlphanumeric(nicknameInput.value)) {
      isNicknameInputInvalid.value = true;
      eventStore.push('Ошибка! Никнейм должен содержать только английские буквы и цифры.', EventTypes.Error);
    }
    else {
      isNicknameInputInvalid.value = false;
    }
  }

  if (isNicknameInputInvalid.value || isEmailInputInvalid.value || isPasswordInputInvalid.value) {
    return;
  }

  const regResponse = (await userApi.registration(
    nicknameInput.value,
    emailInput.value,
    firstPasswordInput.value))
      .onBusinessError(error => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes))
      .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes));

  if (regResponse.error) {
    return;
  }

  authTempToken.value = regResponse.data.Token;
  (await userApi.sendMailVerifyCode(authTempToken.value))
    .onBusinessError(error => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes))
    .onException(() => eventStore.push('Не удалось отправить код! Попробуйте еще раз!', EventTypes.Error as typeof EventTypes));

  emailVerificationIsVisible.value = true;
}
</script>

<style lang="scss" scoped>

.registration-view {
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
    gap: 25px;
    height: fit-content;
    width: 420px;
    padding: 40px;
  }

  &__input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
}

</style>
<template>
  <div class="restore-password__main">
    <BaseBackground :type="2" class="restore-password__container">
      <router-link to="/">
        <img
          class="restore-password__logo" src="@/assets/images/Logo.svg"
          alt="Логотип"
        >
      </router-link>

      <div
        v-if="passwordResetScope === PasswordResetScope.EmailSend"
        class="column gap-8 restore-password__input-container"
      >
        <base-input
          v-model="emailInput"
          class="row m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isEmailInputInvalid"
          :place-holder="'Введите почту'"
          type="text"
        />
        <base-button
          class="m-radius-circle"
          :button-type="2"
          :variant="'filled'"
          @click.stop="sendPasswordResetCode"
        >
          Отправить
        </base-button>
      </div>

      <div
        v-else-if="passwordResetScope === PasswordResetScope.EmailCode"
        class="column gap-8 restore-password__input-container"
      >
        <span class="restore-password__help label-medium m3-bg-2 m-radius-1">
          Отправили код на {{ emailInput }}
        </span>
        <base-input
          v-model="codeInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isCodeInputInvalid"
          :place-holder="'Введите код'"
          type="number"
        />

        <base-button
          class="m-radius-circle"
          :button-type="2"
          :variant="'filled'"
          @click.stop="verifyPasswordResetCodeClick"
        >
          Восстановить
        </base-button>
      </div>

      <div
        v-else-if="passwordResetScope === PasswordResetScope.PasswordInputs"
        class="column gap-8 restore-password__input-container"
      >
        <span class="restore-password__help label-medium m3-bg-2 m-radius-1">
          Введите новый пароль
        </span>
        <base-input
          v-model="passwordInput"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isPasswordInputInvalid"
          :place-holder="'Введите пароль'"
          type="password"
        />
        <base-input
          v-model="passwordInputV2"
          class="m-radius-1 m3-bg-2 m-border m-border-hover m-border-active"
          :mark-as-invalid-input="isPasswordInputV2Invalid"
          :place-holder="'Подтвердите пароль'"
          type="password"
        />
        <base-button
          class="m-radius-circle"
          :button-type="2"
          :variant="'filled'"
          @click.stop="resetPasswordClick"
        >
          Сменить пароль
        </base-button>
      </div>

      <div class="restore-password__links">
        <router-link to="/login">
          Войти
        </router-link>
        <router-link to="/restore">
          Зарегистрироваться
        </router-link>
      </div>
    </BaseBackground>
  </div>
</template>

<script setup lang="ts">
import {inject, ref} from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {UserApi} from "@/api/UserApi";
import {StringExtensions} from "@/helpers/StringExtensions";
import {useRouter} from "vue-router";

const PasswordResetScope = {
  'EmailSend': 1,
  'EmailCode': 2,
  'PasswordInputs': 3
} as const;

const router = useRouter()
const userApi = inject<UserApi>('user-api');
const eventStore = ClientEventStore();

const passwordResetScope = ref<typeof PasswordResetScope>(PasswordResetScope.EmailSend as typeof PasswordResetScope);
const emailInput = ref();
const isEmailInputInvalid = ref(false);

const codeInput = ref<number>();
const isCodeInputInvalid = ref(false);

const passwordInput = ref<string>();
const passwordInputV2 = ref<string>();
const isPasswordInputInvalid = ref(false);
const isPasswordInputV2Invalid = ref(false);

let passwordResetTemporaryToken: string | undefined;

async function sendPasswordResetCode() {
  if (StringExtensions.isNullOrEmpty(emailInput.value)) {
    eventStore.push('Ошибка! Заполните обязательное поле.', EventTypes.Error as typeof EventTypes);
    isEmailInputInvalid.value = true;
    return;
  } else if (!StringExtensions.validateEmail(emailInput.value)) {
    eventStore.push('Ошибка! Не корректный формат почты.', EventTypes.Error as typeof EventTypes);
    isEmailInputInvalid.value = true;
    return;
  } else {
    isEmailInputInvalid.value = false;
  }

  const response = (await userApi.sendPasswordResetCode(emailInput.value))
    .onException(() => eventStore.push('Ошибка! Не корректный формат почты.', EventTypes.Error as typeof EventTypes))
    .onBusinessError((error) => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes));

  if (response.error) {
    return;
  }

  passwordResetScope.value = PasswordResetScope.EmailCode as typeof PasswordResetScope;
}

async function verifyPasswordResetCodeClick() {
  if (codeInput.value === null || codeInput.value === 0) {
    eventStore.push('Ошибка! Заполните обязательное поле.', EventTypes.Error as typeof EventTypes);
    isCodeInputInvalid.value = true;
    return;
  } else {
    isCodeInputInvalid.value = false;
  }

  const response = (await userApi.verifyPasswordResetCode(emailInput.value, codeInput.value))
    .onException(() => eventStore.push('Ошибка! Не удалось подтвердить код, попробуйте еще раз.', EventTypes.Error as typeof EventTypes))
    .onBusinessError((error) => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes));

  if (response.error) {
    return;
  }

  passwordResetTemporaryToken = response.data.Token;
  passwordResetScope.value = PasswordResetScope.PasswordInputs as typeof PasswordResetScope;
  return;
}

async function resetPasswordClick() {
  if (StringExtensions.isNullOrEmpty(passwordInput.value)) {
    eventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error as typeof EventTypes);
    isPasswordInputInvalid.value = true;
    return;
  } else {
    isPasswordInputInvalid.value = false;
  }

  if (StringExtensions.isNullOrEmpty(passwordInputV2.value)) {
    eventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error as typeof EventTypes);
    isPasswordInputV2Invalid.value = true;
    return;
  } else {
    isPasswordInputV2Invalid.value = false;
  }

  if (passwordInput.value !== passwordInputV2.value) {
    eventStore.push('Ошибка! Пароли не совпадают.', EventTypes.Error as typeof EventTypes);
    isPasswordInputV2Invalid.value = true;
    isPasswordInputInvalid.value = true;
    return;
  } else {
    isPasswordInputV2Invalid.value = false;
  }

  const response = (await userApi.resetPassword(emailInput.value, passwordInput.value, passwordResetTemporaryToken))
    .onException(() => eventStore.push('Ошибка! Не удалось сбросить пароль, попробуйте еще раз.', EventTypes.Error as typeof EventTypes))
    .onBusinessError((error) => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes));

  if (response.error) {
    return;
  }

  eventStore.push(
    'Пароль успешно изменён!\n' +
    'Теперь вы можете войти в систему, используя новый пароль.\n' +
    'Рекомендуем сохранить его в надежном месте.', EventTypes.Success as typeof EventTypes);
  await router.push('/login');
}

</script>
<style lang="scss" scoped>
.restore-password {
  &__help {
    color: var(--on-surfacer);
    padding: 8px 16px 8px 16px;
    background: var(--surface-container-low96);
    border: 1px solid var(--surface-container-highest90);
    text-align: start;
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
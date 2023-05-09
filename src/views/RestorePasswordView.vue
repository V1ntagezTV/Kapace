<template>
  <div class="restore-password__main">
    <BaseBackground class="restore-password__container">
      <router-link to="/">
        <img class="restore-password__logo" src="@/assets/images/Logo.svg">
      </router-link>

      <span>Восстановление пароля</span>

      <div class="restore-password__input-container">
        <input
          class="restore-password__input" type="email"
          placeholder="Email" required
        >
      </div>

      <BaseButton :button-type="2">
        Отправить сообщение
      </BaseButton>

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

<script lang="ts">
import {defineComponent} from "vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

export default defineComponent({
  name: "RestorePasswordView",
  components: {
    BaseButton,
    BaseBackground
  }
})
</script>
<style lang="scss" scoped>

.restore-password {
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
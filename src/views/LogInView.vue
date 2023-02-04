<template>
  <div class="login-view__main">
    <BaseBackground class="login-view__container">
      <router-link to="/">
        <img class="login-view__logo" src="@/assets/images/Logo.svg">
      </router-link>

      <span>Авторизация</span>

      <div class="login-view__input-container">
        <input
          class="login-view__input" type="text"
          placeholder="Никнейм или email" required
        >
        <input
          class="login-view__input" type="password"
          placeholder="Пароль" required
        >
      </div>

      <div class="login-view__memorize">
        <input :checked="isRememberMe" type="checkbox">
        <label class="login-view__memorize-label" @click="RememberMeClickHandler">Запомнить меня</label>
      </div>

      <div class="login-view__line-breaker" />

      <BaseButton :button-type="2" @click="LogIn">
        <router-link class="login-view__login-button" to="/">
          Войти
        </router-link>
      </BaseButton>

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

<script lang="ts">
import BaseBackground from "@/components/Body/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import {defineComponent} from "vue";
import {mapMutations, mapState} from 'vuex'

export default defineComponent({
  components: {
    BaseBackground,
    BaseButton
  },
  data() {
    return {
      isRememberMe: false
    }
  },
  methods: {
    ...mapMutations([
      'LogIn',
    ]),
    RememberMeClickHandler() {
      this.isRememberMe = !this.isRememberMe;
    }
  },
  computed: {
    ...mapState({loggedIn: (state: any) => state.loggedIn})
  }
})
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
<template>
  <BaseBackground class="profile-menu__main">
    <div class="profile-menu__nickname-main">
      <div class="profile-menu__nickname-container">
        <span class="profile-menu__nickname">{{ props.nickname }}</span>
        <b class="profile-menu__nickname profile-menu__nickname-tag">#{{ props.tag }}</b>
      </div>
      <span>edit (in dev)</span>
    </div>

    <div class="profile-menu__description">
      <span class="profile-menu__status">
        {{ props.customStatus }}
      </span>

      <div>
        <span class="profile-menu__status">от: </span>
        <span>{{ props.registrationDate }}</span>
      </div>
    </div>

    <div class="profile-menu__menu">
      <BaseButton :button-type="3">
        Активность
      </BaseButton>
      <BaseButton :button-type="3">
        Избранное
      </BaseButton>
      <BaseButton :button-type="3">
        В процессе
      </BaseButton>
      <BaseButton :button-type="3">
        Просмотрено
      </BaseButton>
      <BaseButton :button-type="3">
        Брошено
      </BaseButton>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Body/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

const props = defineProps({
  nickname: {type: String, required: true},
  tag: {type: Number, required: true},
  customStatus: {type: String, required: true},
  registrationDate: {type: String, required: true}
})
</script>

<style lang="scss" scoped>

.profile-menu {
  &__menu {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 30px;
  }

  &__menu-button {
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 15px;
    letter-spacing: 0.04em;

    color: #969BAB;

    border: none;
    background: none;
    text-decoration: none;

    &:hover {
      color: var(--primary);
      cursor: pointer;
    }

    &:active {
      color: #474A57;
    }
  }

  &__main {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  &__nickname-main {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 4px;
  }

  &__nickname-container {
    display: flex;
    align-content: flex-start;
    gap: 4px;
  }

  &__nickname {
    font-style: normal;
    font-weight: 800;
    font-size: 31px;
    line-height: 38px;
    text-align: justify;
    letter-spacing: 0.065em;
    color: #474A57;

    &-tag {
      text-shadow:
          -1px -1px 0 #969BAB,
          0   -1px 0 #969BAB,
          1px -1px 0 #969BAB,
          1px  0   0 #969BAB,
          1px  1px 0 #969BAB,
          0    1px 0 #969BAB,
          -1px  1px 0 #969BAB,
          -1px  0   0 #969BAB;
      color: white;
    }
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__status {
    font-style: normal;
    font-weight: 400;
    line-height: 15px;

    text-align: start;
    letter-spacing: 0.04em;

    color: #969BAB;
  }
}

</style>
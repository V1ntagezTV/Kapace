<template>
  <base-background class="settings__main m-border m-radius-16 gap-16 padding-16" :type="2">
    <div class="settings__avatar column gap-8 fit-content">
      <p class="label-medium fit-content text__one-line">
        Аватар
      </p>
      <avatar-component
        style="overflow: hidden;"
        class="fill m-border m-radius-8 m-radius-8"
        :src="user.imageUrl"
      />
    </div>

    <div class="column gap-16 h__fill">
      <div class="column h__fill v__start gap-8">
        <p class="label-medium text__one-line">
          Отображаемое имя
        </p>
        <div class="row fill h__space-between v__center gap-16">
          <base-input
            v-model="nickname"
            class="column m-border m-border-hover m-border-active m-radius-8 fit-content m3-bg-2"
            :class="{'settings__input-valid': isValidAndFreeNicknameInput, 'settings__input-invalid': isValidAndFreeNicknameInput === false}"
            :place-holder="'Введите имя'"
            maxlength="20"
            :input-validator="(value: String) => StringExtensions.validateNickname(value)"
            @update:modelValue="() => { handleSearch() }"
          >
            <template #end-icon>
              <div v-if="isValidAndFreeNicknameInput === true" class="row gap-8">
                <p style="color: darkgreen;" class="row body-medium text__one-line text__center">
                  Никнейм свободен!
                </p>
                <div class="settings__icon">
                  <check-circle-filled-icon style="color: darkgreen;" />
                </div>
              </div>
              <div v-if="isValidAndFreeNicknameInput === false" class="row gap-8">
                <p style="color: var(--error-light);" class="row body-medium text__one-line text__center">
                  Никнейм занят
                </p>
                <div class="settings__icon">
                  <warning-icon style="color: var(--error-light);" />
                </div>
              </div>
            </template>
          </base-input>
          <base-button
            :class="{'settings__input-valid': isValidAndFreeNicknameInput }"
            class="m-radius-circle" :variant="'filled'"
            @click="saveNewNickname"
          >
            Сохранить
          </base-button>
        </div>
      </div>
      <div class="column h__fill v__start gap-8">
        <p class="label-medium text__one-line">
          Электронная почта
        </p>
        <div class="row fill h__space-between v__center gap-16">
          <base-input
            v-model="user.email"
            class="column m-border  m-radius-8 fit-content m3-bg-2"
            :disabled="true"
          />

          <base-button
            class="m-radius-circle" :variant="'filled'"
            @click="() => { isInEditEmail = true }"
          >
            Изменить
          </base-button>
          <email-change-modal
            v-if="isInEditEmail"
            :current-email="user.email"
            :is-visible="isInEditEmail"
            @on:close="() => isInEditEmail = false"
          />
        </div>
      </div>

      <div class="row gap-16">
        <base-button
          class="m-border m-radius-circle fit-content"
          :variant="'filled'"
          @click="updatePasswordClick"
        >
          Сменить пароль
        </base-button>
        <update-password-modal
          :is-visible="isUpdatePasswordModelVisible"
          @on:close="isUpdatePasswordModelVisible = false"
        />
      </div>
    </div>
    <!-- ELSE USER SETTINGS -->
  </base-background>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import {userStore} from "@/store/UserStore";
import {inject, onBeforeUnmount, ref} from "vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import AvatarComponent from "@/components/Profile/AvatarComponent.vue";
import {UserApi} from "@/api/UserApi";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {ErrorDetails} from "@/api/ApiService";
import {StringExtensions} from "@/helpers/StringExtensions";
import EmailChangeModal from "@/components/Modal/EmailChangeModal.vue";
import CheckCircleFilledIcon from "@/components/Icons/CheckCircleFilledIcon.vue";
import WarningIcon from "@/components/Icons/WarningIcon.vue";
import UpdatePasswordModal from "@/components/Modal/UpdatePasswordModal.vue";

const user = userStore();
const eventStore = ClientEventStore();
const userApi = inject<UserApi>('user-api');

const isUpdatePasswordModelVisible = ref<boolean>(false);
const nickname = ref<string>(user.nickname);
const isForceUpdateNickname = ref<boolean>(false);
const isValidAndFreeNicknameInput = ref<boolean | null>(null);
let timeoutId = null;

const isInEditEmail = ref<boolean>(false);

async function saveNewNickname() {
  if (StringExtensions.isNullOrEmpty(nickname.value)) {
    isValidAndFreeNicknameInput.value = false;
    isForceUpdateNickname.value = false;
    return;
  }

  (await userApi.UpdateNickname(nickname.value, isForceUpdateNickname.value))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes))
    .onBusinessError((errorDetails: ErrorDetails) => {
      if (errorDetails.ErrorCode === 'NicknameAlreadyExists') {
        isValidAndFreeNicknameInput.value = false;
        isForceUpdateNickname.value = false;
      } else if (errorDetails.ErrorCode === 'CallWithoutForceFlag') {
        isForceUpdateNickname.value = true;
        isValidAndFreeNicknameInput.value = true;
      } else {
        eventStore.push(errorDetails.Message, EventTypes.Error as typeof EventTypes)
      }
    });

  if (!isForceUpdateNickname.value) {
    return;
  }

  user.UpdateNickname(nickname.value);
  isValidAndFreeNicknameInput.value = null;
  eventStore.push('Успех! Новый никнейм сохранен!', EventTypes.Success as typeof EventTypes)
}

async function updatePasswordClick() {
  isUpdatePasswordModelVisible.value = true;
}

function handleSearch() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    isForceUpdateNickname.value = false;
    isValidAndFreeNicknameInput.value = undefined;
    await saveNewNickname();
  }, 300);
}

onBeforeUnmount(() => {
  clearTimeout(timeoutId)
});
</script>

<style lang="scss" scoped>
.settings {
  @media (min-width: 0px) {
    &__main {
      display: flex;
      flex-direction: column;
      height: fit-content;
      margin-top: 20px;
    }
  }
  @media (min-width: 720px) {
    &__main {
      display: flex;
      flex-direction: row;
      height: fit-content;
      margin-top: 20px;
    }
  }


  &__avatar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 255px;
  }

  &__icon {
    display: flex;
    height: 40px;
    width: 40px;
    min-height: 40px;
    min-width: 40px;
    user-select: none;

    align-items: center;
    justify-content: center;
  }

  &__input-valid {
    border: 1px green solid;
  }
  &__input-invalid {
    border: 1px red solid;
  }
}
</style>
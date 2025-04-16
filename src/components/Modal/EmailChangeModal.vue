<template>
  <modal-window
    v-show="step === EmailChangingSteps.SendMailCode && refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start h__space-between">
          <div />
          <p class="title-large">
            Шаг 1. Подтверждение адреса<br>электронной почты
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Подтвердите свой прошлый адрес электронной почты<br>({{ currentEmail }}), чтобы его изменить
        </p>
      </div>
    </template>
    <template #footer>
      <base-button
        :variant="'filled'"
        class="m-radius-8"
        @click="sendOldMailCode"
      >
        Отправить код подтверждения
      </base-button>
    </template>
  </modal-window>

  <modal-window
    v-show="step === EmailChangingSteps.CodeInput && refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start v__center h__space-between">
          <icon-button>
            <nav-left-arrow-icon />
          </icon-button>
          <p class="title-large">
            Шаг 2. Введите код
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Проверьте электронную почту,<br>мы отправили вам код подтверждения
        </p>
      </div>
    </template>
    <template #body>
      <base-input
        v-model="oldMailVerifyingCode"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isInvalidOldMailVerifyingCode"
        :place-holder="'Код подтверждения'"
      />
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="verifyOldMailCode"
        >
          Подтвердить
        </base-button>
        <base-button :variant="'outline'" class="m-radius-8">
          Отправить еще раз
        </base-button>
      </div>
    </template>
  </modal-window>

  <modal-window
    v-show="step === EmailChangingSteps.NewEmailInput && refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start h__space-between">
          <p class="title-large">
            Шаг 3. Введите адрес новой<br>электронной почты
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Подтвердите свой новый адрес электронной<br>почты чтобы его сохранить
        </p>
      </div>
    </template>
    <template #body>
      <base-input
        v-model="newMail"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isInvalidNewMail"
        :place-holder="'Введите новую почту'"
      />
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="sendNewMailCode"
        >
          Отправить
        </base-button>
      </div>
    </template>
  </modal-window>

  <modal-window
    v-show="step === EmailChangingSteps.NewMailCodeInput && refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start v__center h__space-between">
          <p class="title-large">
            Шаг 4. Подтверждение нового адреса<br>электронной почты
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Проверьте электронную почту,<br>мы отправили вам код подтверждения
        </p>
      </div>
    </template>
    <template #body>
      <base-input
        v-model="newMailVerifyingCode"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :place-holder="'Код подтверждения'"
        :mark-as-invalid-input="isInvalidNewMailVerifyingCode"
      />
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="verifyNewMailCode"
        >
          Подтвердить
        </base-button>
        <base-button :variant="'outline'" class="m-radius-8">
          Отправить еще раз
        </base-button>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import ModalWindow from "@/components/Base/ModalWindow.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import {defineEmits, inject, onMounted, ref, watch} from "vue";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {UserApi} from "@/api/UserApi";
import IconButton from "@/components/Base/Buttons/IconButton.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import NavLeftArrowIcon from "@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue";
import {userStore} from "@/store/UserStore";
import {useRoute, useRouter} from "vue-router";
import {StringExtensions} from "@/helpers/StringExtensions";

enum EmailChangingSteps {
  SendMailCode = 1,
  CodeInput = 2,
  NewEmailInput = 3,
  NewMailCodeInput = 4
}

const router = useRouter();
const eventStore = ClientEventStore();
const user = userStore();
const userApi = inject<UserApi>('user-api');

onMounted(async () => {
  if (!user.loggedIn) {
    eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as typeof EventTypes);
    await router.push('/login');
  }
})

const emits = defineEmits<{
  (emitName: 'on:close') : void
}>();

const props = defineProps({
  currentEmail: {type: String, required: true},
  isVisible: {type: Boolean, required: true}
});

const currentEmail = user.email;
const step = ref<EmailChangingSteps>(EmailChangingSteps.SendMailCode);
const refIsVisible = ref<boolean>(props.isVisible);

const oldMailVerifyingCode = ref<string>();
const isInvalidOldMailVerifyingCode = ref<boolean>(false);

const newMail = ref<string>();
const isInvalidNewMail = ref<boolean>(false);

const newMailVerifyingCode = ref<string>();
const isInvalidNewMailVerifyingCode = ref<boolean>(false);

let updateMailToken: string = null;

watch(() => props.isVisible, (newValue: boolean) => {
  refIsVisible.value = newValue;
})

async function sendOldMailCode() {
  const response = (await userApi.SendUpdateMailCode())
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes))
    .onBusinessError(() => eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as typeof EventTypes));
  if (response.error) {
    return;
  }

  step.value = EmailChangingSteps.CodeInput;
}

async function verifyOldMailCode() {
  if (StringExtensions.isNullOrEmpty(oldMailVerifyingCode.value)) {
    isInvalidOldMailVerifyingCode.value = true;
    return;
  }

  const response = (await userApi.VerifyOldMailCode(oldMailVerifyingCode.value))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes))
    .onBusinessError((errorDetails) => eventStore.push(errorDetails.ErrorCode, EventTypes.Error as typeof EventTypes));
  if (response.error) {
    isInvalidOldMailVerifyingCode.value = true;
    return;
  }

  updateMailToken = response.data.Token;
  isInvalidOldMailVerifyingCode.value = false;
  step.value = EmailChangingSteps.NewEmailInput;
}

async function sendNewMailCode() {
  if (!StringExtensions.validateEmail(newMail.value)) {
    isInvalidNewMail.value = true;
    return;
  }

  const response = (await userApi.SendNewMailCode(newMail.value, updateMailToken))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes))
    .onBusinessError((errorDetails) => eventStore.push(errorDetails.ErrorCode, EventTypes.Error as typeof EventTypes));

  if (response.error) {
    isInvalidNewMail.value = true;
    return;
  }

  isInvalidNewMail.value = false;
  step.value = EmailChangingSteps.NewMailCodeInput;
}

async function verifyNewMailCode() {
  if (StringExtensions.isNullOrEmpty(newMailVerifyingCode.value)) {
    isInvalidNewMailVerifyingCode.value = false;
    return;
  }

  const response = (await userApi.VerifyNewMailCode(newMail.value, newMailVerifyingCode.value, updateMailToken))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes))
    .onBusinessError((errorDetails) => eventStore.push(errorDetails.ErrorCode, EventTypes.Error as typeof EventTypes));

  if (response.error) {
    isInvalidNewMailVerifyingCode.value = false;
    return;
  }

  isInvalidNewMailVerifyingCode.value = true;
  user.UpdateEmail(newMail.value);
  emits('on:close');
}

function onClose() {
  refIsVisible.value = false;
  emits('on:close');
}
</script>

<style scoped>

</style>
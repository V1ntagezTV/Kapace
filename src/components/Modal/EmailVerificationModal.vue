<template>
  <modal-window
    v-show="refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start v__center h__space-between">
          <p class="h__fill title-large">
            Введите код
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Проверьте электронную почту {{ props.currentEmail }},<br>мы отправили вам код подтверждения
        </p>
      </div>
    </template>
    <template #body>
      <base-input
        v-model="verificationCode"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isInvalidVerifyingCode"
        :place-holder="'Код подтверждения'"
      />
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="verifyRegistrationCode"
        >
          Подтвердить
        </base-button>
        <base-button
          class="m-radius-8"
          :variant="'outline'"
          @click="sendMailVerifyCode"
        >
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
import {defineEmits, inject, ref, watch} from "vue";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {UserApi} from "@/api/UserApi";
import IconButton from "@/components/Base/Buttons/IconButton.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import {userStore} from "@/store/UserStore";
import {useRouter} from "vue-router";
import {StringExtensions} from "@/helpers/StringExtensions";

const router = useRouter();
const eventStore = ClientEventStore();
const user = userStore();
const userApi = inject<UserApi>('user-api');

const emits = defineEmits<{
  (emitName: 'on:close') : void
}>();

const props = defineProps({
  currentEmail: {type: String, required: true},
  isVisible: {type: Boolean, required: true},
  userToken: {type: String, required: true}
});

const refIsVisible = ref<boolean | null>(props.isVisible);

const verificationCode = ref<string>();
const isInvalidVerifyingCode = ref<boolean>(false);

watch(() => props.isVisible, (newValue: boolean) => {
  refIsVisible.value = newValue;
});

async function sendMailVerifyCode() {
  (await userApi.sendMailVerifyCode(props.userToken))
    .onBusinessError(error => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes))
    .onException(() => eventStore.push('Не удалось отправить код! Попробуйте еще раз!', EventTypes.Error as typeof EventTypes));
}

async function verifyRegistrationCode() {
  if (StringExtensions.isNullOrEmpty(verificationCode.value)) {
    isInvalidVerifyingCode.value = true;
    return;
  }

  const response = (await userApi.verifyRegistrationCode(verificationCode.value, props.userToken))
    .onBusinessError(error => eventStore.push(error.Message, EventTypes.Error as typeof EventTypes))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error as typeof EventTypes));

  if (response.error) {
    return;
  }

  isInvalidVerifyingCode.value = false;
  await router.push('/login');
  onClose();
}
function onClose() {
  refIsVisible.value = false;
  emits('on:close');
}
</script>

<style scoped>

</style>
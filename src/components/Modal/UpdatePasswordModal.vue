<template>
  <modal-window
    v-show="refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start v__center h__space-between">
          <p class="h__fill title-large">
            Изменение пароля
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Подтвердите старый и новый пароли
        </p>
      </div>
    </template>
    <template #body>
      <base-input
        v-model="oldPassword"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isOldPasswordInvalid"
        :place-holder="'Старый пароль'"
      />
      <base-input
        v-model="newPasswordV1"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isNewPasswordV1Invalid"
        :place-holder="'Новый пароль'"
      />
      <base-input
        v-model="newPasswordV2"
        class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
        :mark-as-invalid-input="isNewPasswordV2Invalid"
        :place-holder="'Подтвердите новый пароль'"
      />
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="updatePasswordClick"
        >
          Подтвердить
        </base-button>
      </div>
    </template>
  </modal-window>
</template>

<script setup lang="ts">
import ModalWindow from "@/components/Base/ModalWindow.vue";
import {useRouter} from "vue-router";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {userStore} from "@/store/UserStore";
import {defineEmits, inject, ref, watch} from "vue";
import {UserApi} from "@/api/UserApi";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseInput from "@/components/Base/BaseInput.vue";
import XIcon from "@/components/Icons/xIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";

const user = userStore();
const router = useRouter();
const eventStore = ClientEventStore();
const userApi = inject<UserApi>('user-api');

const emits = defineEmits<{
  (emitName: 'on:close') : void
}>();

const props = defineProps({
  isVisible: {type: Boolean, required: true}
});

const oldPassword = ref<string>();
const isOldPasswordInvalid = ref<boolean>();
const newPasswordV1 = ref<string>();
const isNewPasswordV1Invalid = ref<boolean>();
const newPasswordV2 = ref<string>();
const isNewPasswordV2Invalid = ref<boolean>();


const refIsVisible = ref<boolean | null>(props.isVisible);

watch(() => props.isVisible, (newValue: boolean) => {
  refIsVisible.value = newValue;
});

function onClose() {
  refIsVisible.value = false;
  emits('on:close');
}

async function updatePasswordClick() {


  if (newPasswordV1.value != newPasswordV2.value) {
    eventStore.push("Ошибка! Новые пароли должны совпадать!", EventTypes.Error as typeof EventTypes);
    return;
  }

  await userApi.UpdatePassword(oldPassword.value, newPasswordV1.value);
}
</script>

<style scoped>

</style>
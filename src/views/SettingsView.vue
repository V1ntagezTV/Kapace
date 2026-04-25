<template>
  <base-background class="settings__main m-border m-radius-16 gap-16 padding-16" :type="2">
    <settings-profile-header :image-url="user.imageUrl" />

    <div class="column gap-16 h__fill">
      <settings-nickname-field
        :nickname="nickname"
        :availability="availability"
        :saving="saving"
        :input-validator="nicknameValidator"
        @update:nickname="onNicknameUpdate"
        @probe="scheduleNicknameProbe"
        @save="saveNickname"
      />

      <settings-email-section
        :email="user.email"
        :change-open="emailChangeOpen"
        @open-change="emailChangeOpen = true"
        @close-change="emailChangeOpen = false"
      />

      <settings-password-section
        :modal-open="passwordModalOpen"
        @open-modal="passwordModalOpen = true"
        @close-modal="passwordModalOpen = false"
      />
    </div>
  </base-background>
</template>

<script lang="ts" setup>
import BaseBackground from '@/components/Base/BaseBackground.vue';
import SettingsEmailSection from '@/components/Settings/SettingsEmailSection.vue';
import SettingsNicknameField from '@/components/Settings/SettingsNicknameField.vue';
import SettingsPasswordSection from '@/components/Settings/SettingsPasswordSection.vue';
import SettingsProfileHeader from '@/components/Settings/SettingsProfileHeader.vue';
import { useSettingsNickname } from '@/composables/settings/useSettingsNickname';
import { userStore } from '@/store/UserStore';
import { ref } from 'vue';

const user = userStore();

const {
    nickname,
    availability,
    saving,
    saveNickname,
    scheduleNicknameProbe,
    nicknameValidator,
} = useSettingsNickname();

const emailChangeOpen = ref(false);
const passwordModalOpen = ref(false);

function onNicknameUpdate(value: string) {
    nickname.value = value;
}
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
}
</style>

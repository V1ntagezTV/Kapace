<template>
  <div class="settings-profile-header">
    <p class="label-medium fit-content text__one-line">
      Аватар
    </p>
    <avatar-component
      class="settings-profile-header__avatar fill m-border m-radius-8"
      style="overflow: hidden;"
      :src="imageUrl"
    />
  </div>
</template>

<script lang="ts" setup>
import AvatarComponent from '@/components/Profile/AvatarComponent.vue';

defineProps<{
  imageUrl: string;
}>();
</script>

<style lang="scss" scoped>
.settings-profile-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  width: 255px;

  &__avatar {
    border-radius: 8px;
  }
}
</style>

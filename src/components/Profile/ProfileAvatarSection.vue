<template>
  <div class="profile-view__avatar-container">
    <image-zoom
      class="profile-view__avatar-zoom"
      :src="avatarSrc"
      alt="Аватар профиля"
      thumbnail-border-radius="16px"
      :thumbnail-fill="true"
      :thumbnail-hover-scale="true"
    />

    <router-link :to="'/settings'">
      <base-button
        class="theater__edit fill m-border m-radius-circle body-medium"
        variant="outline"
      >
        Настройки
      </base-button>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from '@/components/Base/BaseButton.vue';
import ImageZoom from '@/components/UseReadyComponents/ImageZoom.vue';

defineProps<{
  avatarSrc: string;
}>();
</script>

<style lang="scss" scoped>
.profile-view {
  &__avatar-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }

  &__avatar-zoom {
    width: 100%;
  }
}
</style>

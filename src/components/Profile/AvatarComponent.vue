<template>
  <div class="profile-avatar">
    <div class="profile-avatar__container">
      <img
        class="profile-avatar__avatar"
        :src="displaySrc"
        alt="Аватар профиля"
        @error="onImageError"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { resolveUserAvatarSrc } from '@/helpers/UserAvatarResolver';

const props = defineProps({
  src: { type: String, required: true }
});

const fallbackSrc = require('@/assets/images/DefaultImage.png') as string;
const hasError = ref(false);

const displaySrc = computed(() => {
  if (hasError.value) {
    return fallbackSrc;
  }

  return resolveUserAvatarSrc(props.src);
});

function onImageError() {
  hasError.value = true;
}

watch(
  () => props.src,
  () => {
    hasError.value = false;
  }
);

</script>

<style lang="scss" scoped>

.profile-avatar {
  &__avatar {
    display: flex;
    height: 100%;
    width: 100%;
  }

  &__container {
    overflow: hidden;
  }
}

</style>

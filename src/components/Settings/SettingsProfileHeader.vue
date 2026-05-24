<template>
  <div class="settings-profile-header">
    <p class="label-medium fit-content text__one-line">
      Аватар
    </p>
    <div
      class="settings-profile-header__avatar-wrapper m-border m-radius-8"
      :class="{ 'settings-profile-header__avatar-wrapper--uploading': uploading }"
    >
      <avatar-component
        class="settings-profile-header__avatar"
        :src="displayImageUrl"
      />
      <button
        type="button"
        class="settings-profile-header__overlay"
        :disabled="uploading"
        aria-label="Загрузить изображение"
        @click="openFilePicker"
      >
        <upload-arrow class="settings-profile-header__overlay-icon" />
        <span class="settings-profile-header__overlay-text body-small">
          Загрузить изображение
        </span>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        class="settings-profile-header__file-input"
        accept="image/png,image/jpeg,image/webp,image/gif"
        @change="onFileSelected"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import AvatarComponent from '@/components/Profile/AvatarComponent.vue';
import UploadArrow from '@/components/Icons/UploadArrow.vue';
import { ImageService } from '@/api/ImageService';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { resolveUserAvatarSrc } from '@/helpers/UserAvatarResolver';
import { computed, inject, onMounted, ref } from 'vue';
import { UserApi } from '@/api/UserApi';

const props = defineProps<{
  imageUrl: string;
}>();

const store = userStore();
const eventStore = ClientEventStore();
const imageService = inject<ImageService>('image-service');
const userApi = inject<UserApi>('user-api');

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const localImageUrl = ref(props.imageUrl);

const displayImageUrl = computed(() => resolveUserAvatarSrc(localImageUrl.value || store.imageUrl));

onMounted(async () => {
  if (!userApi) {
    return;
  }

  const response = await userApi.getCurrent();
  if (response.data) {
    store.applyCurrentUser(response.data);
    localImageUrl.value = response.data.User.ImageUrl ?? '';
  }
});

function openFilePicker() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file || !imageService) {
    return;
  }

  uploading.value = true;

  try {
    const result = await imageService.insertUserAvatar(file);
    const imageLink = result.ImageLink ?? '';
    store.UpdateImageUrl(imageLink);
    localImageUrl.value = imageLink;
    eventStore.push('Аватар обновлён', EventTypes.Success);
  } catch {
    eventStore.push('Не удалось загрузить изображение', EventTypes.Error);
  } finally {
    uploading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.settings-profile-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  width: 255px;

  &__avatar-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    align-self: flex-start;
    overflow: hidden;
    border-radius: 8px;

    &--uploading {
      opacity: 0.7;
      pointer-events: none;
    }
  }

  &__avatar {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 8px;

    :deep(.profile-avatar) {
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(.profile-avatar__container) {
      width: 100%;
      height: 100%;
    }

    :deep(.profile-avatar__avatar) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__file-input {
    display: none;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__overlay-icon {
    width: 28px;
    height: 28px;

    :deep(path),
    :deep(circle) {
      stroke: #fff;
    }
  }

  &__overlay-text {
    text-align: center;
    padding: 0 8px;
  }
}
</style>

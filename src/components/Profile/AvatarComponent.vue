<template>
  <div class="profile-avatar">
    <div class="profile-avatar__container">
      <img
        class="profile-avatar__avatar"
        :src="image"
        alt="Аватар профиля"
        @error="() => { image = require('@/assets/images/DefaultImage.png') }"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const props = defineProps({
  src: { type: String, required: true }
})

const image = ref<string>(props.src ?? '@/assets/images/DefaultImage.png');

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
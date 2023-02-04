<template>
  <div class="profile-avatar">
    <div class="profile-avatar__container">
      <img class="profile-avatar__avatar" :src="props.src">
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  src: { type: String, required: true }
})

</script>



<style lang="scss" scoped>

.profile-avatar {
  &__avatar {
    width: 255px;
  }

  &__container {
    display: flex;
    border-radius: 4px;
    overflow: hidden;
  }
}

</style>
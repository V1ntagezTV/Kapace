<template>
  <BaseBackground :type="3" class="profile-menu__main h__start gap-8">
    <div class="profile__nickname">
      <span class="profile-menu__nickname headline-medium">{{ nickname }}</span>
      <b class="headline-medium profile-menu__nickname profile-menu__nickname-tag">#{{ tag }}</b>
    </div>
    <div class="column fit-content gap-8">
      <div class="row gap-8">
        <span style="color: #969BAB;">Почта</span><span>{{ email }}</span>
      </div>
      <div class="row gap-8">
        <span style="color: #969BAB;">Создано</span><span>{{ createdAt }}</span>
      </div>
    </div>

    <div class="splitter" />

    <div class="row row-dynamic gap-8">
      <filter-chips
        v-for="role in roles"
        :key="role"
        class="m3-bg-2"
        style="color: var(--primary40)"
        :text="role"
      />
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {PropType} from "vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";

const props = defineProps({
  nickname: {type: String, required: true},
  tag: {type: Number, required: true},
  roles: {type: Object as PropType<string[]>, required: true},
  createdAt: {type: String, required: true},
  email: {type: String, required: true}
});
</script>

<style lang="scss" scoped>
.profile {
  &__nickname {
    display: flex;
    width: fit-content;
  }
}

.profile-menu {
  &__menu {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 30px;
  }

  &__main {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  &__nickname {

    &-tag {
      text-shadow:
          -1px -1px 0 #969BAB,
          0   -1px 0 #969BAB,
          1px -1px 0 #969BAB,
          1px  0   0 #969BAB,
          1px  1px 0 #969BAB,
          0    1px 0 #969BAB,
          -1px  1px 0 #969BAB,
          -1px  0   0 #969BAB;
      color: white;
    }
  }
}

</style>
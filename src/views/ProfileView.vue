<template>
  <div class="col__ profile-view__main">
    <profile-avatar-section :avatar-src="avatarDisplaySrc" />

    <div class="profile-middle__main">
      <profile-menu
        :nickname="userNickname"
        :created-at="userCreatedAt"
        :tag="userId"
        :roles="userRoles"
        :email="userEmail"
      />

      <profile-favorites-section
        :favorites="userFavorites"
        :favorite-selected-category="favoriteSelectedCategory"
        :is-menu-dropped="isFavoritesMenuDropped"
        :all-category="favoritesAllCategory"
        :watching-category="favoritesWatchingCategory"
        :selected-status="selectedFavoritesStatus"
        :default-category-label="defaultFavoriteStatus"
        :format-date="getDateStr"
        @toggle-all="selectAllCategory"
        @toggle-watching="selectWatchingCategory"
        @update:category="onFavoriteCategoryChange"
        @toggle-menu="toggleFavoritesMenu"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ProfileAvatarSection from '@/components/Profile/ProfileAvatarSection.vue';
import ProfileFavoritesSection from '@/components/Profile/ProfileFavoritesSection.vue';
import ProfileMenu from '@/components/Profile/ProfileMenu.vue';
import { useProfile } from '@/composables/profile/useProfile';

const {
  userId,
  userNickname,
  userCreatedAt,
  userRoles,
  userEmail,
  avatarDisplaySrc,
  userFavorites,
  favoriteSelectedCategory,
  isFavoritesMenuDropped,
  favoritesAllCategory,
  favoritesWatchingCategory,
  selectedFavoritesStatus,
  defaultFavoriteStatus,
  getDateStr,
  selectAllCategory,
  selectWatchingCategory,
  onFavoriteCategoryChange,
  toggleFavoritesMenu,
} = useProfile();
</script>

<style lang="scss" scoped>
.profile-view {
  @media (min-width: 0px) {
    &__main {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 20px 0;
    }
  }
  @media (min-width: 720px) {
    &__main {
      display: grid;
      grid-template-columns: 255px 1fr;
      gap: 20px;
      margin: 20px 0;
    }
  }
}

.profile-middle {
  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
  }
}
</style>

<template>
  <base-background
    :type="2"
    class="column m-border-primary"
    style="background: var(--primary95)"
  >
    <div class="profile__favorites-header row dynamic h__space-between v__center h__padding-16">
      <p class="title-large v__padding-8">
        Избранные
      </p>

      <div class="fit-content v__center gap-8">
        <filter-chips-v2
          class="profile__filter m-border-primary"
          :class="{ 'profile__filter-enabled': allCategory }"
          @click="emit('toggle-all')"
        >
          <template #text>
            <p class="body-medium h__padding-8">
              Все
            </p>
          </template>
        </filter-chips-v2>
        <filter-chips-v2
          class="profile__filter m-border-primary"
          :class="{ 'profile__filter-enabled': watchingCategory }"
          @click="emit('toggle-watching')"
        >
          <template #text>
            <p class="body-medium h__padding-8">
              Смотрю
            </p>
          </template>
        </filter-chips-v2>
        <base-selector
          :model-value="favoriteSelectedCategory"
          :is-dropped="isMenuDropped"
          :selectable-values="[
            FavoriteStatuses.Stash,
            FavoriteStatuses.Loved,
            FavoriteStatuses.Planned,
            FavoriteStatuses.Paused,
            FavoriteStatuses.Finished,
            FavoriteStatuses.Dropped,
          ]"
          @update:model-value="emit('update:category', $event)"
        >
          <template #header>
            <filter-chips
              :class="{ 'profile__filter-enabled': favoriteSelectedCategory !== defaultCategoryLabel }"
              class="profile__filter m-border-primary m3-bg-3 m-radius-16"
              :text="favoriteSelectedCategory"
              :enable-menu-icon="true"
              @click="emit('toggle-menu')"
            >
              <template #menu-icon>
                <material-drop-arrow />
              </template>
            </filter-chips>
          </template>
        </base-selector>
      </div>
    </div>

    <div class="splitter" />

    <div class="profile__favorites-list">
      <router-link
        v-for="favorite in favorites"
        :key="favorite.Id"
        class="profile__favorites-unit gap-8 dynamic row h__space-between v__center v__padding-8"
        :to="{ name: 'theater', params: { id: favorite.ContentId } }"
      >
        <div class="profile__favorite-title body-large">
          {{ favorite.Title }}
        </div>
        <div class="gap-8 row v__center">
          <filter-chips-v2
            v-show="favorite.Stars"
            class="profile__favorite-tag"
            :enable-text-icon="true"
          >
            <template #text>
              <p class="profile__favorite-tag-title body-small row h__padding-8">
                {{ favorite.Stars }}
              </p>
            </template>
            <template #text-icon>
              <star-icon style="color: var(--on-primary-container-light)" />
            </template>
          </filter-chips-v2>

          <filter-chips-v2
            v-show="favorite.Status && selectedStatus === null"
            class="profile__favorite-tag"
          >
            <template #text>
              <p
                class="profile__favorite-tag-title body-small text__one-line h__padding-8"
                style="color: var(--on-primary-container-light)"
              >
                {{ FavoriteStatuses[favorite.Status] }}
              </p>
            </template>
          </filter-chips-v2>

          <filter-chips-v2 class="profile__favorite-tag">
            <template #text>
              <p
                class="profile__favorite-tag-title body-small text__one-line h__padding-8"
                style="color: var(--on-primary-container-light)"
              >
                {{ formatDate(favorite.CreatedAt) }}
              </p>
            </template>
          </filter-chips-v2>
        </div>
      </router-link>
    </div>
  </base-background>
</template>

<script lang="ts" setup>
import type { FavoriteGetList } from '@/api/FavoriteApi';
import BaseBackground from '@/components/Base/BaseBackground.vue';
import BaseSelector from '@/components/Base/Selector/BaseSelector.vue';
import MaterialDropArrow from '@/components/Icons/MaterialDropArrow.vue';
import StarIcon from '@/components/Icons/StarIcon.vue';
import FilterChips from '@/components/UseReadyComponents/MaterialComponents/FilterChips.vue';
import FilterChipsV2 from '@/components/UseReadyComponents/MaterialComponents/FilterChipsV2.vue';
import type { FavoriteStatus } from '@/models/FavoriteStatuses';
import { FavoriteStatuses } from '@/models/FavoriteStatuses';

defineProps<{
  favorites: FavoriteGetList[];
  favoriteSelectedCategory: string;
  isMenuDropped: boolean;
  allCategory: boolean;
  watchingCategory: boolean;
  selectedStatus: FavoriteStatus | null;
  defaultCategoryLabel: string;
  formatDate: (dateNum: number) => string;
}>();

const emit = defineEmits<{
  (e: 'toggle-all'): void;
  (e: 'toggle-watching'): void;
  (e: 'update:category', value: string): void;
  (e: 'toggle-menu'): void;
}>();
</script>

<style lang="scss" scoped>
.profile {
  &__favorites-header {
    min-height: 64px;
    height: fit-content;
  }

  &__filter {
    width: fit-content;
    background: var(--on-primary-light);
    color: var(--primary40);
    padding: 0 8px;
  }

  &__filter-enabled {
    background: var(--primary40);
    color: var(--on-primary-light);
  }

  &__favorites-list {
    padding-top: 8px;
    padding-bottom: 16px;
    overflow: hidden;
  }

  &__favorite-title {
    text-align: start;
    width: fit-content;
  }

  &__favorite-tag {
    background: var(--primary-container-light);
  }

  &__favorite-tag-title {
    color: var(--on-primary-container-light);
  }

  &__favorites-unit {
    display: flex;
    min-height: 48px;
    min-width: 0;
    padding-left: 16px;
    padding-right: 16px;

    &:hover {
      color: var(--on-primary-container-light);
      background: var(--primary-container-light);
    }
    &:hover .profile__favorite-tag {
      background: var(--primary80);
    }
  }
}
</style>

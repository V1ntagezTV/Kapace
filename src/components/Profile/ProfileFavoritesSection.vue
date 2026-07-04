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

    <div
      class="profile__favorites-table"
      :class="{ 'profile__favorites-table--with-category': showCategoryColumn }"
    >
      <div class="profile__favorites-head label-small">
        <span class="profile__favorites-cell profile__favorites-cell--name">Имя</span>
        <span class="profile__favorites-cell profile__favorites-cell--rating">Оценка</span>
        <span
          v-if="showCategoryColumn"
          class="profile__favorites-cell profile__favorites-cell--category"
        >
          Категория
        </span>
        <span class="profile__favorites-cell profile__favorites-cell--date">Дата</span>
      </div>

      <router-link
        v-for="favorite in favorites"
        :key="favorite.Id"
        class="profile__favorites-row body-medium"
        :to="{ name: 'theater', params: { id: favorite.ContentId } }"
      >
        <span class="profile__favorites-cell profile__favorites-cell--name text__one-line">
          {{ favorite.Title }}
        </span>
        <span class="profile__favorites-cell profile__favorites-cell--rating">
          <span
            v-if="favorite.Stars"
            class="profile__favorite-tag profile__favorites-rating row v__center gap-8"
          >
            <star-icon class="profile__favorites-star" />
            <span class="body-small">{{ favorite.Stars }}</span>
          </span>
        </span>
        <span
          v-if="showCategoryColumn"
          class="profile__favorites-cell profile__favorites-cell--category text__one-line"
        >
          {{ getFavoriteStatusLabel(favorite.Status) }}
        </span>
        <span class="profile__favorites-cell profile__favorites-cell--date text__one-line label-small">
          <span class="profile__favorites-date--full">{{ formatDate(favorite.CreatedAt) }}</span>
          <span class="profile__favorites-date--short">{{ formatDateOnly(favorite.CreatedAt) }}</span>
        </span>
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
import { FavoriteStatus, FavoriteStatuses, getFavoriteStatusLabel } from '@/models/FavoriteStatuses';
import { computed } from 'vue';

const props = defineProps<{
  favorites: FavoriteGetList[];
  favoriteSelectedCategory: string;
  isMenuDropped: boolean;
  allCategory: boolean;
  watchingCategory: boolean;
  selectedStatus: FavoriteStatus | null;
  defaultCategoryLabel: string;
  formatDate: (dateNum: number) => string;
  formatDateOnly: (dateNum: number) => string;
}>();

const emit = defineEmits<{
  (e: 'toggle-all'): void;
  (e: 'toggle-watching'): void;
  (e: 'update:category', value: string): void;
  (e: 'toggle-menu'): void;
}>();

const showCategoryColumn = computed(() => {
  if (props.selectedStatus !== null) {
    return false;
  }
  return props.favorites.some((favorite) => getFavoriteStatusLabel(favorite.Status) !== '');
});
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

  &__favorites-table {
    display: grid;
    padding: 8px 0 12px;
    overflow-x: auto;
    min-width: 0;

    &--with-category {
      grid-template-columns: minmax(120px, 1fr) max-content max-content max-content;
    }

    &:not(.profile__favorites-table--with-category) {
      grid-template-columns: minmax(120px, 1fr) max-content max-content;
    }
  }

  &__favorites-head,
  &__favorites-row {
    display: contents;
  }

  &__favorites-head &__favorites-cell {
    min-height: 32px;
    color: var(--primary40);
  }

  &__favorites-row &__favorites-cell {
    min-height: 48px;
    color: inherit;
    text-decoration: none;
  }

  &__favorites-row:hover &__favorites-cell {
    background: var(--primary-container-light);
    color: var(--on-primary-container-light);

    .profile__favorite-tag {
      background: var(--primary80);
    }
  }

  &__favorites-cell {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 12px;
  }

  &__favorites-cell--name {
    grid-column: 1;
    justify-content: flex-start;
    text-align: start;
    padding-left: 16px;
  }

  &__favorites-cell--rating {
    grid-column: 2;
    justify-content: flex-start;
    border-left: 1px solid var(--primary90);
    padding-left: 12px;
  }

  &__favorites-table--with-category &__favorites-cell--category {
    grid-column: 3;
    justify-content: flex-start;
    border-left: 1px solid var(--primary90);
    padding-left: 12px;
  }

  &__favorites-table--with-category &__favorites-cell--date {
    grid-column: 4;
    justify-content: flex-end;
    text-align: end;
    padding-right: 16px;
    border-left: 1px solid var(--primary90);
    padding-left: 12px;
  }

  &__favorites-table:not(.profile__favorites-table--with-category) &__favorites-cell--date {
    grid-column: 3;
    justify-content: flex-end;
    text-align: end;
    padding-right: 16px;
    border-left: 1px solid var(--primary80);
    padding-left: 12px;
  }

  &__favorite-tag {
    background: var(--primary-container-light);
    border-radius: 8px;
    padding: 4px 8px;
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    gap: 8px;
  }

  &__favorites-rating {
    width: fit-content;
  }

  &__favorites-star {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--on-primary-container-light);
  }

  &__favorites-date--short {
    display: none;
  }

  @media (max-width: 719px) {
    &__favorites-date--full {
      display: none;
    }

    &__favorites-date--short {
      display: inline;
    }
  }
}
</style>

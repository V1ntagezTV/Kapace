<template>
  <div class="material edit-list__main">
    <async-search-selector
      class="edit-list__search m-radius-1 m3-bg-1 m-border m-border-active"
      :placeholder="'Поиск'"
      :values="searchSelectableValueModels?.map(x => x.Title) ?? []"
      :is-dropped="isSearchMenuDropped"
      :call-updater-delay="500"
      @change:input="searchByInput"
      @onkeydown:enter="pressEnterSearch"
    />
    <div class="edit-list__filters gap-8">
      <filter-chips
        v-show="currentUserStore.loggedIn"
        class="m3-bg-1 m-border"
        :class="{'edit-list__filters-unit--enabled': filters.isMy.value}"
        :text="'Мои'"
        @click.stop="clickOnMineFilter"
      />
      <base-selector
        v-model="filters.orderBy.value"
        class="edit-list__filters-unit m3-bg-1 m-radius-8 m-border"
        :title="'Сортировать по'"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="['По идентификатору', 'По названию', 'Сначала новые', 'Сначала старые']"
        @update:modelValue="() => {updatePage(0)}"
      />
      <base-selector
        v-model="filters.historyType.value"
        class="edit-list__filters-unit m3-bg-1 m-radius-8 m-border"
        :title="'Тип'"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="['Все', 'Дорама', 'Серия']"
        @update:modelValue="() => {updatePage(0)}"
      />
      <base-selector
        v-model="filters.status.value"
        class="edit-list__filters-unit m3-bg-1 m-radius-8 m-border"
        :title="'Статус'"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="['Все', 'Не одобрено', 'Одобрено']"
        @update:modelValue="() => {updatePage(0)}"
      />
    </div>

    <base-background
      v-for="unit in changes"
      v-show="dataIsReady" :key="unit"
      :type="2"
      class="edit-list__history m-radius-28 m3-bg-1"
    >
      <div class="edit-list__header dynamic">
        <div>
          <p class="title-large">
            {{ unit.Title }}#{{ unit.HistoryId }}
          </p>
          <p>{{ StringExtensions.getDateStr(unit.CreatedAt) }}</p>
        </div>

        <div class="row gap-26">
          <filter-chips
            class="edit-list__author m-border m-radius-1"
            :text="unit.CreatedBy ? 'Автор#'+unit.CreatedBy : 'Система'"
            :enable-text-icon="true"
          >
            <template #text-icon>
              <user-icon-outlined />
            </template>
          </filter-chips>
          <filter-chips
            v-if="unit.ApprovedBy != null"
            class="edit-list__approver m-border m-radius-1"
            :text="(unit.ApprovedBy ? 'Пользователь#' + unit.ApprovedBy : 'Система')"
            :enable-text-icon="true"
          >
            <template #text-icon>
              <mark-icon />
            </template>
          </filter-chips>
        </div>
      </div>

      <template v-if="unit.HistoryType === HistoryType.Content">
        <div class="edit-list__image-box">
          <img
            class="edit-list__content-image m-radius-2"
            :src="resolveBackendImageLink(unit.AvatarImageLink)"
            alt="Изображение контента"
            @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
          >
        </div>
      </template>
      <template v-else-if="unit.HistoryType === HistoryType.Episode">
        <iframe
          class="edit-list__image-box"
          :src="getVideoLinkByChangesComparisons(unit)"
          frameborder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
        />
      </template>
      <div class="edit-list__body">
        <div
          v-for="fieldComparison in unit.FieldsComparisons"
          :key="fieldComparison"
          class="edit-list__field-comparison"
        >
          <div class="edit-list__field-name body-large">
            {{ fieldComparison.Name }}
          </div>
          <div class="row gap-8">
            <span v-if="fieldComparison.OldValue" class="body-medium edit-list__field-comparison--old">
              {{ fieldComparison.OldValue }}
            </span>
            <span class="body-medium edit-list__field-comparison--new">
              {{ fieldComparison.NewValue }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="unit.ApprovedBy === null"
        class="edit-list__footer h__space-between v__center"
      >
        <a>
          <base-button
            :variant="'filled'"
            class="material m-radius-circle body-large edit-list__icon"
            @click="approveClick(unit.HistoryId)"
          >
            Одобрить
          </base-button>
        </a>
      </div>
    </base-background>
    <div class="row gap-16" style="width: 100%">
      <base-text-button
        v-if="offset !== 0"
        class="edit-list__paging-button title-medium m3-bg-1 m-radius-28 gap-8"
        @click="updatePage(-10)"
      >
        <nav-left-arrow-icon />
        Предыдущая страница
      </base-text-button>
      <base-text-button
        class="edit-list__paging-button title-medium m3-bg-1 m-radius-28 gap-8"
        @click="updatePage(5)"
      >
        Следующая страница
        <nav-right-arrow-icon />
      </base-text-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {HistoryType} from "@/api/Enums/HistoryType";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import MarkIcon from "@/components/Icons/MaterialIcons/MarkIcon.vue";
import UserIconOutlined from "@/components/Icons/MaterialIcons/UserIconOutlined.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import NavLeftArrowIcon from "@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue";
import NavRightArrowIcon from "@/components/Icons/MaterialIcons/NavRightArrowIcon.vue";
import {StringExtensions} from "@/helpers/StringExtensions";
import { resolveBackendImageLink } from "@/helpers/ImageLinkResolver";
import { useChangesList } from "@/composables/edits/useChangesList";

const {
  currentUserStore,
  searchSelectableValueModels,
  filters,
  dataIsReady,
  changes,
  isSearchMenuDropped,
  offset,
  updatePage,
  clickOnMineFilter,
  approveClick,
  getVideoLinkByChangesComparisons,
  pressEnterSearch,
  searchByInput,
} = useChangesList();
</script>

<style lang="scss" scoped>
.edit-list {
  &__paging-button {
    display: flex;
    padding: 24px;
    color: var(--font-gray);
    transition: border-radius .3s cubic-bezier(.2,0,0,1), background-color .3s cubic-bezier(.2,0,0,1);

    &:hover {
      background: var(--secondary-container-light);
      border-radius: 48px;
    }
  }

  &__author {
    color: var(--on-secondary-container-light);
    background: var(--secondary-container-light);
    border-color: var(--primary60);
  }

  &__approver {
    background: #CBE6B0;
    border-color: #79BD33;
  }

  &__field-name {
    color: #38383C;
    grid-column-start: 0;
    grid-column-end: 2;
  }

  &__field-comparison--old {
    grid-row-start: 2;
    color: #79747E;
    text-decoration: line-through;
  }

  &__field-comparison--new {
    grid-row-start: 3;
    color: var(--primary40);
  }

  &__image-box {
    display: flex;
    height: 450px;
    width: 100%;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    & img {
      width: 100%;
      height: 100%;
      margin: 0 24px 0 24px;
      object-fit: cover;
    }
  }

  &__search-box {
    display: flex;
    width: 100%;
    gap: 8px;
  }

  &__search-unit {
    display: flex;
    height: 42px;
  }

  &__search {
    background: var(--surface-container-lowest100);
    transition: background-color 0.2s;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    width: 100%;

    &-unit {
      display: flex;
      width: fit-content;
      height: 32px;

      &--enabled {
        color: white;
        background: var(--primary40);
      }

      &:hover {
        background: var(--surface-container-high92);
      }
    }
  }

  &__main {
    display: grid;
    grid-auto-rows: max-content;
    justify-items: center;
    align-items: center;
    padding-bottom: 40px;
    gap: 10px;
  }

  &__history {
    width: 100%;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    gap: 16px;
    padding: 0 24px 24px 24px;
  }

  &__title {
    color: var(--on-surface-light);
    background: var(--surface-container-low96);
  }

  &__header {
    display: flex;
    width: 100%;

    justify-content: space-between;
    align-items: center;
    text-align: start;

    padding: 16px 24px;
    gap: 8px 24px;
  }

  &__body {
    display: flex;
    width: 100%;
    flex-wrap: wrap; /* Перенос строк */

    justify-content: start;
    align-items: center;
    text-align: start;

    padding: 16px 24px;
    gap: 8px 24px;
  }

  &__change {
    display: flex;
  }

  &__value {
    display: grid;
  }

  &__icon {
    display: flex;
    color: white;
    width: fit-content;
    padding: 8px 48px;
  }

  &__label {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }
}
</style>
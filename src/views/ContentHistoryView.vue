<template>
  <div class="content-history">
    <div class="content-history__header">
      <router-link
        :to="{ name: 'theater', params: { id: contentId } }"
        class="content-history__back title-medium"
      >
        ← Назад к контенту
      </router-link>
      <h1 class="headline-medium content-history__title">
        История{{ contentTitle ? `: ${contentTitle}` : '' }}
      </h1>
    </div>

    <div v-if="!dataIsReady" class="content-history__status body-large">
      Загрузка...
    </div>

    <p v-else-if="changes.length === 0" class="content-history__empty body-large">
      История изменений пуста
    </p>

    <template v-else>
      <base-background
        v-for="unit in changes"
        :key="unit.HistoryId"
        :type="2"
        class="content-history__entry m-radius-16 m3-bg-1"
      >
        <div class="content-history__entry-header">
          <div>
            <p class="title-large content-history__entry-title">
              {{ unit.Title ?? 'Изменение' }} #{{ unit.HistoryId }}
            </p>
          </div>

          <div class="content-history__meta row">
            <div class="content-history__author-wrap">
              <filter-chips
                class="content-history__author m-border m-radius-1"
                :text="unit.CreatedBy ? 'Автор#' + unit.CreatedBy : 'Система'"
                :enable-text-icon="true"
              >
                <template #text-icon>
                  <user-icon-outlined />
                </template>
              </filter-chips>
              <div class="content-history__meta-tooltip label-medium">
                Изменено: {{ formatHistoryDate(unit.CreatedAt) }}
              </div>
            </div>

            <div
              v-if="unit.ApprovedBy != null"
              class="content-history__approver-wrap"
            >
              <filter-chips
                class="content-history__approver m-border m-radius-1"
                :text="unit.ApprovedBy ? 'Пользователь#' + unit.ApprovedBy : 'Система'"
                :enable-text-icon="true"
              >
                <template #text-icon>
                  <mark-icon />
                </template>
              </filter-chips>
              <div
                v-if="unit.ApprovedAt != null"
                class="content-history__meta-tooltip label-medium"
              >
                Одобрено: {{ formatHistoryDate(unit.ApprovedAt) }}
              </div>
            </div>

            <filter-chips
              v-else
              class="content-history__pending m-border m-radius-1"
              text="Ожидает одобрения"
            />
          </div>
        </div>

        <div class="content-history__body">
          <field-diff-block
            v-for="fieldComparison in unit.FieldsComparisons"
            :key="fieldComparison.Name"
            :name="fieldComparison.Name"
            :old-value="fieldComparison.OldValue"
            :new-value="fieldComparison.NewValue"
          />
        </div>
      </base-background>

      <div class="row gap-16 content-history__pagination">
        <base-text-button
          v-if="offset !== 0"
          class="content-history__paging-button title-medium m3-bg-1 m-radius-28 gap-8"
          @click="changePage(-pageSize)"
        >
          <nav-left-arrow-icon />
          Предыдущая страница
        </base-text-button>
        <base-text-button
          v-if="hasNextPage"
          class="content-history__paging-button title-medium m3-bg-1 m-radius-28 gap-8"
          @click="changePage(pageSize)"
        >
          Следующая страница
          <nav-right-arrow-icon />
        </base-text-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BaseBackground from '@/components/Base/BaseBackground.vue';
import BaseTextButton from '@/components/Base/BaseTextButton.vue';
import FieldDiffBlock from '@/components/ContentHistory/FieldDiffBlock.vue';
import FilterChips from '@/components/UseReadyComponents/MaterialComponents/FilterChips.vue';
import MarkIcon from '@/components/Icons/MaterialIcons/MarkIcon.vue';
import UserIconOutlined from '@/components/Icons/MaterialIcons/UserIconOutlined.vue';
import NavLeftArrowIcon from '@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue';
import NavRightArrowIcon from '@/components/Icons/MaterialIcons/NavRightArrowIcon.vue';
import { useContentHistory } from '@/composables/content/useContentHistory';

const route = useRoute();

const contentId = computed(() => {
  const routeParam = route.params.id;
  if (Array.isArray(routeParam)) {
    return String(routeParam[0] ?? '');
  }
  return String(routeParam ?? '');
});

const {
  dataIsReady,
  changes,
  contentTitle,
  offset,
  hasNextPage,
  pageSize,
  changePage,
  formatHistoryDate,
} = useContentHistory(contentId);
</script>

<style lang="scss" scoped>
.content-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
  padding-bottom: 24px;
  text-align: left;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__back {
    color: var(--primary40);
    text-decoration: none;
    width: fit-content;

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: 0;
    color: var(--on-surface-light);
  }

  &__status,
  &__empty {
    width: 100%;
    padding: 32px 24px;
    text-align: center;
    color: var(--font-gray);
  }

  &__empty {
    color: var(--on-surface-variant-light);
  }

  &__entry {
    width: 100%;
    overflow: visible;
  }

  &__entry-header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 10px 16px;
    gap: 6px 12px;
    overflow: visible;
  }

  &__entry-title {
    margin: 0;
  }

  &__meta {
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
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

  &__author-wrap,
  &__approver-wrap {
    position: relative;
    display: inline-flex;

    &:hover .content-history__meta-tooltip,
    &:focus-within .content-history__meta-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
    }
  }

  &__meta-tooltip {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translate(-50%, 4px);
    padding: 6px 10px;
    border-radius: 6px;
    background: #303036;
    color: #fff;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: 20;
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #303036;
    }
  }

  &__pending {
    background: #FFF3E0;
    border-color: #FFB74D;
    color: #E65100;
  }

  &__body {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 4px 16px 12px;
    gap: 8px;
  }

  &__pagination {
    width: 100%;
  }

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
}
</style>

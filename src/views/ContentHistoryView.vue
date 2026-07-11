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

    <div class="content-history__settings">
      <span class="content-history__settings-title label-medium">
        Настройки отображения
      </span>
      <label class="content-history__setting">
        <input
          v-model="hideUnapproved"
          class="content-history__setting-input"
          type="checkbox"
          @change="resetAndLoad"
        >
        <span class="content-history__setting-switch" aria-hidden="true" />
        <span class="content-history__setting-label body-medium">
          Скрыть неодобренные изменения
        </span>
      </label>
    </div>

    <div v-if="!dataIsReady" class="content-history__status body-large">
      Загрузка...
    </div>

    <p v-else-if="changes.length === 0" class="content-history__empty body-large">
      {{ hideUnapproved ? 'Одобренных изменений нет' : 'История изменений пуста' }}
    </p>

    <template v-else>
      <div class="content-history__timeline">
        <template
          v-for="(unit, index) in changes"
          :key="unit.HistoryId"
        >
          <section
            class="content-history__timeline-item"
            :class="{ 'content-history__timeline-item--last': index === changes.length - 1 }"
          >
            <div class="content-history__timeline-item-header">
              <aside class="content-history__timeline-node">
                <time
                  class="content-history__timeline-date label-medium"
                  :datetime="toIsoDateTime(unit.CreatedAt)"
                >
                  <span class="content-history__timeline-date-day">
                    {{ getTimelineDateParts(unit.CreatedAt).date }}
                  </span>
                  <span class="content-history__timeline-date-time">
                    {{ getTimelineDateParts(unit.CreatedAt).time }}
                  </span>
                </time>

                <div
                  class="content-history__timeline-marker"
                  :class="`content-history__timeline-marker--${getChangeApprovalStatus(unit)}`"
                  :title="getTimelineStatusLabel(unit)"
                >
                  <check-circle-filled-icon
                    v-if="getChangeApprovalStatus(unit) === 'approved'"
                    class="content-history__timeline-marker-icon"
                  />
                  <warning-icon
                    v-else-if="getChangeApprovalStatus(unit) === 'pending'"
                    class="content-history__timeline-marker-icon"
                  />
                  <x-icon
                    v-else
                    class="content-history__timeline-marker-icon content-history__timeline-marker-icon--small"
                  />
                </div>
              </aside>

              <header class="content-history__entry-header">
                <span class="content-history__entry-id label-medium">
                  #{{ unit.HistoryId }}
                </span>

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
                    v-if="getChangeApprovalStatus(unit) === 'approved'"
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
                    v-else-if="getChangeApprovalStatus(unit) === 'pending'"
                    class="content-history__pending m-border m-radius-1"
                    text="Ожидает одобрения"
                  />

                  <filter-chips
                    v-else
                    class="content-history__rejected m-border m-radius-1"
                    text="Отклонено"
                  />
                </div>
              </header>
            </div>

            <div class="content-history__timeline-item-content">
              <div
                class="content-history__timeline-rail"
                aria-hidden="true"
              />

              <base-background
                :type="2"
                class="content-history__entry m-radius-16 m3-bg-1"
              >
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
            </div>
          </section>
        </template>
      </div>

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
import CheckCircleFilledIcon from '@/components/Icons/CheckCircleFilledIcon.vue';
import WarningIcon from '@/components/Icons/WarningIcon.vue';
import XIcon from '@/components/Icons/xIcon.vue';
import MarkIcon from '@/components/Icons/MaterialIcons/MarkIcon.vue';
import UserIconOutlined from '@/components/Icons/MaterialIcons/UserIconOutlined.vue';
import NavLeftArrowIcon from '@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue';
import NavRightArrowIcon from '@/components/Icons/MaterialIcons/NavRightArrowIcon.vue';
import { useContentHistory } from '@/composables/content/useContentHistory';
import type { ChangeUnit } from '@/api/Responses/V1GetChangesComparisonsResponse';

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
  hideUnapproved,
  hasNextPage,
  pageSize,
  resetAndLoad,
  changePage,
  formatHistoryDate,
  getChangeApprovalStatus,
} = useContentHistory(contentId);

function getTimelineStatusLabel(unit: ChangeUnit): string {
  const status = getChangeApprovalStatus(unit);

  if (status === 'approved') {
    return 'Одобрено';
  }

  if (status === 'rejected') {
    return 'Отклонено';
  }

  return 'Ожидает одобрения';
}

function getTimelineDateParts(timestamp: number): { date: string; time: string } {
  const formatted = formatHistoryDate(timestamp);
  const separatorIndex = formatted.indexOf(', ');

  if (separatorIndex === -1) {
    return { date: formatted, time: '' };
  }

  return {
    date: formatted.slice(0, separatorIndex),
    time: formatted.slice(separatorIndex + 2),
  };
}

function toIsoDateTime(timestamp: number): string {
  const normalized = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}
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

  &__settings {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    width: 100%;
    margin: 4px 0 8px;
    padding: 10px 14px;
    border: 1px solid var(--outline-variant-light);
    border-radius: 12px;
    background: var(--surface-container-lowest100);
  }

  &__settings-title {
    color: var(--on-surface-variant-light);
  }

  &__setting {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  &__setting-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);

    &:focus-visible + .content-history__setting-switch {
      outline: 2px solid var(--primary40);
      outline-offset: 2px;
    }

    &:checked + .content-history__setting-switch {
      background: var(--primary40);
      border-color: var(--primary40);

      &::after {
        transform: translateX(16px);
      }
    }
  }

  &__setting-switch {
    position: relative;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    border: 1px solid var(--outline-light);
    border-radius: 999px;
    background: var(--surface-variant-light);
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--surface-container-lowest100);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s ease;
    }
  }

  &__setting-label {
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

  &__timeline {
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;

    &::before {
      content: '';
      position: absolute;
      left: 92px;
      top: 12px;
      bottom: 12px;
      width: 2px;
      background: var(--outline-variant-light);
      border-radius: 1px;
      z-index: 0;
      pointer-events: none;
    }
  }

  &__timeline-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 12px;
    position: relative;
    z-index: 1;
    min-width: 0;

    &--last {
      padding-bottom: 0;
    }
  }

  &__timeline-item-header {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    column-gap: 14px;
    align-items: center;
    min-width: 0;
  }

  &__timeline-item-content {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    column-gap: 14px;
    align-items: start;
    min-width: 0;
  }

  &__timeline-rail {
    width: 100%;
  }

  &__timeline-node {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 24px;
    align-items: center;
    gap: 8px;
  }

  &__timeline-date {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    margin: 0;
    color: var(--on-surface-variant-light);
    line-height: 1.2;
    white-space: nowrap;
    justify-self: end;
  }

  &__timeline-date-day {
    font-weight: 500;
  }

  &__timeline-date-time {
    color: var(--font-gray);
    font-weight: 400;
  }

  &__timeline-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--surface-container-lowest100, #fff);

    &--approved {
      color: #2e7d32;
    }

    &--pending {
      color: #f9a825;
    }

    &--rejected {
      background: #ffebee;
      color: #c62828;
      border: 2px solid #ef5350;
    }
  }

  &__timeline-marker-icon {
    width: 24px;
    height: 24px;

    &--small {
      width: 14px;
      height: 14px;
    }
  }

  &__entry {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  &__entry-header {
    display: flex;
    width: 100%;
    min-width: 0;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 2px;
    gap: 4px 8px;
    overflow: visible;
    min-height: 24px;
  }

  &__entry-id {
    margin: 0;
    color: var(--font-gray);
    letter-spacing: 0.02em;
    line-height: 16px;
  }

  &__meta {
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 1 1 auto;
    min-width: 0;

    :deep(.filter-chips__box) {
      grid-template-rows: 22px;
      width: max-content;
      max-width: none;
      padding: 0 6px;
      border-radius: 6px;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    :deep(.filter-chips__text) {
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 0.02em;
      padding: 0 4px;
      white-space: nowrap;
    }

    :deep(.filter-chips__icon) {
      width: 14px;
      height: 14px;
    }

    :deep(.filter-chips__icon svg) {
      width: 14px;
      height: 14px;
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

  &__author-wrap,
  &__approver-wrap {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;

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

  &__rejected {
    background: #FFEBEE;
    border-color: #EF5350;
    color: #C62828;
  }

  &__body {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 12px 16px;
    gap: 8px;
    overflow: hidden;

    :deep(.field-diff__lines),
    :deep(.avatar-diff),
    :deep(.image-list-diff) {
      width: calc(100% + 32px);
      margin: 0 -16px;
    }
  }

  &__pagination {
    width: 100%;
    margin-top: 4px;
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

  @media (max-width: 640px) {
    &__timeline {
      &::before {
        left: 64px;
        top: 10px;
        bottom: 10px;
      }
    }

    &__timeline-item-header,
    &__timeline-item-content {
      grid-template-columns: 76px minmax(0, 1fr);
      column-gap: 10px;
    }

    &__timeline-node {
      grid-template-columns: minmax(0, 1fr) 20px;
      gap: 6px;
    }

    &__timeline-date {
      font-size: 10px;
      line-height: 1.15;
    }

    &__timeline-marker {
      width: 20px;
      height: 20px;
    }

    &__timeline-marker-icon {
      width: 20px;
      height: 20px;

      &--small {
        width: 12px;
        height: 12px;
      }
    }

    &__meta {
      :deep(.filter-chips__box) {
        grid-template-rows: 20px;
        padding: 0 5px;
      }

      :deep(.filter-chips__text) {
        font-size: 10px;
      }

      :deep(.filter-chips__icon),
      :deep(.filter-chips__icon svg) {
        width: 12px;
        height: 12px;
      }
    }

    &__body {
      padding: 10px 12px;

      :deep(.field-diff__lines),
      :deep(.avatar-diff),
      :deep(.image-list-diff) {
        width: calc(100% + 24px);
        margin: 0 -12px;
      }
    }

    &__paging-button {
      padding: 16px 20px;
    }
  }
}
</style>

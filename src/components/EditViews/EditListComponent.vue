<template>
  <div v-if="dataIsReady" class="material edit-list__main ">
    <async-search-selector
      v-model="filters.search"
      class="edit-list__search m-radius-1"
      :placeholder="'Поиск'"
      :values="searchSelectableValueModels.map(x => x.Title)"
      @change:input="searchBy"
    />
    <div class="edit-list__filters">
      <base-selector
        v-model="filters.sortBy"
        class="edit-list__filters-unit m3-bg-2 m-radius-1"
        :title="'Сортировать по'"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="['По названию', 'По дате']"
      />
      <base-selector
        v-model="filters.historyType"
        class="edit-list__filters-unit m3-bg-2 m-radius-1"
        :title="'Все'"
        :menu-alignment="MenuAlignment.Left"
        :selectable-values="['Все', 'Дорама', 'Серия']"
      />
      <filter-chips 
        class="m3-bg-2 m-radius-1"
        :class="{'edit-list__filters-unit--enabled': filters.isMy.value}"
        :text="'Мои'"
        @click.stop="clickOnMineFilter"
      />
      <filter-chips
        class="m3-bg-2 m-radius-1"
        :class="{'edit-list__filters-unit--enabled': filters.isApproved.value}"
        :text="'Не одобренные'"
        @click.stop="clickOnApprovedFilter"
      />
    </div>

    <base-background
      v-for="unit in changes" :key="unit"
      class="edit-list__history m-radius-28 m3-bg-2"
    >
      <div class="edit-list__header">
        <div>
          <p class="title-large">
            {{ unit.Title }}#{{ unit.HistoryId }}
          </p>
          <p>{{ getDateStr(unit.CreatedAt) }}</p>
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
            :src="imageService.getImageLink(unit.ImageId, contentId)"
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
          <span v-if="fieldComparison.OldValue" class="body-medium edit-list__field-comparison--old">
            {{ fieldComparison.OldValue }}
          </span>
          <span class="body-medium edit-list__field-comparison--new">
            {{ fieldComparison.NewValue }}
          </span>
        </div>
      </div>
      <div
        v-if="unit.ApprovedBy === null"
        class="edit-list__footer h__space-between v__center"
      >
        <base-button
          :variant="'filled'"
          class="material m-radius-circle body-large edit-list__icon"
          @click="approveClick(unit.HistoryId, 0)"
        >
          Одобрить
        </base-button>
      </div>
    </base-background>
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref} from "vue";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {ChangeUnit} from "@/api/Responses/V1GetChangesComparisonsResponse";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {HistoryType} from "@/api/Enums/HistoryType";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import {ContentService, V1SearchByResponseUnit} from "@/api/ContentService";
import {ImageService} from "@/api/ImageService";
import MarkIcon from "@/components/Icons/MaterialIcons/MarkIcon.vue";
import UserIconOutlined from "@/components/Icons/MaterialIcons/UserIconOutlined.vue";

const imageService = inject<ImageService>('image-service');
const changesHistoryService = inject<ChangesHistoryService>('changes-history-service');
const contentService = inject<ContentService>('content-service');

const searchSelectableValueModels = ref<V1SearchByResponseUnit[]>([]);
const filters = {
  search: ref<string | null>(null),
  sortBy: ref<string | null>(null),
  historyType: ref<string | null>(null),
  isApproved: ref<boolean | null>(null),
  isMy: ref<boolean | null>(null)
};

const dataIsReady = ref(false);
const changes = ref<ChangeUnit[]>()
const limit = 20;
const offset = 0;

onMounted(async () => {
  dataIsReady.value = false;
  const response = await changesHistoryService.getChangesComparisons({
    Approved: filters.isApproved.value,
    CreatedByIds: filters.isMy.value ? [0] : [],
    HistoryTypes: [],
    Ids: [],
    Limit: limit,
    Offset: offset,
    TargetIds: [],
  });

  changes.value = response.Changes;
  dataIsReady.value = true;
})

function getHistoryTypes(value: string) {
  if (value === 'Серия') {
    return [HistoryType.Episode as typeof HistoryType];
  }

  if (value === 'Дорама') {
    return [HistoryType.Content as typeof HistoryType];
  }

  return [];
}

function clickOnMineFilter() {
  filters.isMy.value = !filters.isMy.value
}

function clickOnApprovedFilter() {
  filters.isApproved.value = !filters.isApproved.value;
}

async function approveClick(historyId: number, userId: number) {
  await changesHistoryService.approve({
    HistoryId: historyId,
    UserId: userId
  })
}

function getVideoLinkByChangesComparisons(units: ChangeUnit): string {
  return units.FieldsComparisons.find(unit => unit.Name === 'Видео').NewValue;
}

async function searchBy(input: string, isSelected: boolean) {
  const response = await contentService.searchBy(input);
  searchSelectableValueModels.value = response.Units;

  if (isSelected) {
    const selectedContentId = searchSelectableValueModels.value.find(content => content.Title === input).ContentId;

    console.log(selectedContentId);
    const request = {
      Approved: filters.isApproved.value,
      CreatedByIds: filters.isMy.value ? [0] : [],
      HistoryTypes: getHistoryTypes(filters.historyType.value),
      Ids: [],
      Limit: limit,
      Offset: offset,
      TargetIds: [selectedContentId]
    };
    console.log(request);
    const response = await changesHistoryService.getChangesComparisons(request);

    changes.value = response.Changes;
  }
}

function getDateStr(dateNum: number) : string {
  const date = new Date(dateNum);
  const formatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return formatter.format(date) + " " + date.toLocaleDateString();
}
</script>

<style lang="scss" scoped>
.edit-list {
  &__author {
    background: var(--primary90);
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
    background: var(--surface-container-default94);
    transition: background-color 0.2s;

    &:hover {
      background: var(--surface-container-high92);
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    column-gap: 8px;
    width: 100%;

    &-unit {
      display: flex;
      width: fit-content;
      height: 32px;

      &--enabled {
        color: white;
        background: var(--primary40);
      }
    }
  }

  &__main {
    display: grid;
    grid-auto-rows: max-content;
    justify-items: center;
    align-items: center;
    padding: 16px;
    gap: 16px;
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
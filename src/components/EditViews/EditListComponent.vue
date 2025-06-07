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
            :src="imageService.getImageLink(
              unit.ImageId,
              // Идентификатор будущего контента формирует
              // HistoryId - если контент новый
              // TargetId - если редактируется существующий материал
              (unit.TargetId === null || unit.TargetId === 0) ? unit.HistoryId : unit.TargetId)"
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
import {inject, onMounted, ref} from "vue";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {ChangeUnit} from "@/api/Responses/V1GetChangesComparisonsResponse";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {HistoryChangesOrderType, HistoryType} from "@/api/Enums/HistoryType";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import {MenuAlignment} from "@/components/Base/Selector/Internal/MenuAlignment";
import AsyncSearchSelector from "@/components/Base/Selector/AsyncSearchSelector.vue";
import {ContentService, V1SearchByResponseUnit} from "@/api/ContentService";
import {ImageService} from "@/api/ImageService";
import MarkIcon from "@/components/Icons/MaterialIcons/MarkIcon.vue";
import UserIconOutlined from "@/components/Icons/MaterialIcons/UserIconOutlined.vue";
import BaseTextButton from "@/components/Base/BaseTextButton.vue";
import NavLeftArrowIcon from "@/components/Icons/MaterialIcons/NavLeftArrowIcon.vue";
import NavRightArrowIcon from "@/components/Icons/MaterialIcons/NavRightArrowIcon.vue";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {StringExtensions} from "@/helpers/StringExtensions";
import {userStore} from "@/store/UserStore";
import {useRouter} from "vue-router";

const imageService = inject<ImageService>('image-service');
const changesHistoryService = inject<ChangesHistoryService>('changes-history-service');
const contentService = inject<ContentService>('content-service');
const clientEventStore = ClientEventStore();
const router = useRouter();
const currentUserStore = userStore();

const searchSelectableValueModels = ref<V1SearchByResponseUnit[]>([]);
const filters = {
  contentIds: ref<number[]>([]),
  search: ref<string | null>(null),
  orderBy: ref<string | null>('По умолчанию'),
  historyType: ref<string | null>(''),
  status: ref<string | null>(''),
  isMy: ref<boolean | null>(null)
};

const dataIsReady = ref(false);
const changes = ref<ChangeUnit[]>();
const isSearchMenuDropped = ref(false);
const limit = 5;
let offset = 0;

onMounted(async () => {
  dataIsReady.value = false;
  await updatePage(0);
  dataIsReady.value = true;
});

async function updatePage(addOffset: number = 0) {
  dataIsReady.value = false;

  if (addOffset < 0 && (offset + addOffset) <= 0) {
    offset = 0;
  } else {
    offset += addOffset;
  }

  const response = await changesHistoryService.getChangesComparisons({
    Approved: getApprovedStatus(filters.status.value),
    CreatedByIds: filters.isMy.value && currentUserStore.loggedIn ? [currentUserStore.userId] : [],
    HistoryTypes: getHistoryTypes(filters.historyType.value),
    OrderBy: getOrderByType(filters.orderBy.value),
    Ids: [],
    Limit: limit,
    Offset: offset,
    TargetIds: filters.contentIds?.value ?? [],
  });

  changes.value = response.data.Changes;

  dataIsReady.value = true;
}

function getApprovedStatus(filterStatus: string) : boolean | null {
  if (filterStatus === 'По умолчанию') {
    return null;
  } else if (filterStatus === 'Не одобрено') {
    return false;
  } else if (filterStatus === 'Одобрено') {
    return true;
  }
}

function getHistoryTypes(value: string) : typeof HistoryType[]{
  if (value === 'Серия') {
    return [HistoryType.Episode as typeof HistoryType];
  } else if (value === 'Дорама') {
    return [HistoryType.Content as typeof HistoryType];
  }
  return [];
}

function getOrderByType(selectedOrder: string) : typeof HistoryChangesOrderType {
  if (selectedOrder === 'Сначала старые') {
    return HistoryChangesOrderType.ByCreated as typeof HistoryChangesOrderType;
  } else if (selectedOrder === 'По названию') {
    return HistoryChangesOrderType.ByName as typeof HistoryChangesOrderType;
  } else if (selectedOrder === 'По идентификатору') {
    return HistoryChangesOrderType.ById as typeof HistoryChangesOrderType;
  } else if (selectedOrder === 'Сначала новые') {
    return HistoryChangesOrderType.ByCreatedDescending as typeof HistoryChangesOrderType;
  }
  return HistoryChangesOrderType.Unspecified as typeof HistoryChangesOrderType;
}

async function clickOnMineFilter() {
  if (currentUserStore.loggedIn) {
    filters.isMy.value = !filters.isMy.value
    await updatePage(0);
    return;
  }

  clientEventStore.push("Сначала необходимо авторизоваться!", EventTypes.Error);
}

async function approveClick(historyId: number) {
  if (!currentUserStore.loggedIn) {
    clientEventStore.push('Для начала необходимо авторизоваться!', EventTypes.Error);
    await router.push('/login');
    return;
  }

  const userId = currentUserStore.userId;
  const unit = changes.value.find(change => change.HistoryId === historyId);

  const response = (await changesHistoryService.approve(historyId, userId))
    .onException(() => clientEventStore.push("Ошибка сервера! Заявка не одобрена.", EventTypes.Error as typeof EventTypes))
    .onBusinessError((error) => clientEventStore.push(error.Message, EventTypes.Error as typeof EventTypes));

  if (response.data) {
    unit.ApprovedAt = Date.now();
    unit.ApprovedBy = userId;
    clientEventStore.push("Успех! Одобрено!", EventTypes.Success)
  }
}

function getVideoLinkByChangesComparisons(units: ChangeUnit): string {
  return units.FieldsComparisons.find(unit => unit.Name === 'Видео').NewValue;
}

async function pressEnterSearch(input: string) {
  // Скрываем выпадающий список.
  searchSelectableValueModels.value = [];

  const foundedContents = await contentService.searchBy(input);
  filters.contentIds.value = foundedContents.Units.map(c => c.ContentId);
  await updatePage()
}

async function searchByInput(input: string, isSelected: boolean) {
  const response = await contentService.searchBy(input);
  searchSelectableValueModels.value = response.Units;

  // IsSelected равен true, когда был выбран элемент из выпадающего списка
  if (isSelected) {
    filters.contentIds.value = [searchSelectableValueModels.value.find(content => content.Title === input).ContentId];
    await updatePage();
  }

  isSearchMenuDropped.value = searchSelectableValueModels.value.length > 0;
}
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
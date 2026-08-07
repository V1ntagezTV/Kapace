<template>
  <div class="person">
    <div class="person__sidebar column gap-16">
      <PersonAvatar
        v-if="isDataReady && personInfo"
        :image-link="resolveBackendImageLink(personInfo.ImageLink)"
      />

      <div class="person__icons-box">
        <div
          class="person__icon-button"
          aria-label="Пожаловаться"
          @click="openReportModal"
        >
          <report-icon />
        </div>

        <div
          class="person__icon-button"
          @click="router.push({ name: 'person-history', params: { id: personId } })"
        >
          <history-icon />
        </div>

        <div
          class="person__icon-button"
          @click="router.push({ name: 'edit-person', params: { person: personId } })"
        >
          <edit-icon class="person__action-icon" />
        </div>
      </div>

      <base-background
        v-if="metaItems.length"
        class="person__meta"
        :type="2"
      >
        <div
          v-for="item in metaItems"
          :key="item.id"
          class="person__meta-item person__meta-item--stacked"
        >
          <div class="person__meta-main">
            <component :is="item.icon" class="person__meta-icon" />
            <p class="label-large person__meta-label">
              {{ item.label }}
            </p>
          </div>
          <p class="person__meta-value">
            {{ item.value }}
          </p>
        </div>
      </base-background>
    </div>

    <div class="person__content">
      <PersonDetails
        v-if="isDataReady && personInfo"
        :person="personInfo"
      />

      <album-images
        v-if="albumImages.length > 0"
        :images="albumImages"
        :max-rows="2"
      />

      <section v-if="isDataReady && filmographyItems.length > 0" class="person__filmography">
        <div class="person__filmography-grid">
          <SearchItem
            v-for="content in filmographyItems"
            :key="content.Id"
            :content="content"
          />
        </div>
      </section>

      <comments-block
        v-if="isDataReady"
        target-type="Person"
        :target-id="personId"
      />
    </div>

    <report-modal
      :is-visible="isReportModalOpen"
      target-type="Person"
      :target-id="personId"
      @on:close="closeReportModal"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, watch, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PersonAvatar from '@/components/Person/PersonAvatar.vue';
import PersonDetails from '@/components/Person/PersonDetails.vue';
import BaseBackground from '@/components/Base/BaseBackground.vue';
import AlbumImages from '@/components/UseReadyComponents/AlbumImages.vue';
import SearchItem from '@/components/Body/Search/SearchItem.vue';
import CalendarIcon from '@/components/Icons/Calendar.vue';
import HistoryIcon from '@/components/Icons/MaterialIcons/HistoryIcon.vue';
import EditIcon from '@/components/Icons/MaterialIcons/EditIcon.vue';
import ReportIcon from '@/components/Icons/ReportIcon.vue';
import ReportModal from '@/components/Modal/ReportModal.vue';
import { PersonService, V1PersonInfo, V1GetPersonByIdResponse } from '@/api/PersonService';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { SearchContentFactory } from '@/components/Body/Search/SearchItemViewFactory';
import { SearchItemViewModel } from '@/components/Body/Search/ViewModels/SearchItemViewModel';
import { resolveBackendImageLink } from '@/helpers/ImageLinkResolver';
import CommentsBlock from "@/components/Comments/CommentsBlock.vue";

const route = useRoute();
const router = useRouter();
const personService = inject<PersonService>('person-service')!;
const user = userStore();
const eventStore = ClientEventStore();

const personId = ref<string>(resolveRoutePersonId());
const isDataReady = ref(false);
const isReportModalOpen = ref(false);
const details = ref<V1GetPersonByIdResponse | null>(null);
const albumImages = ref<{ src: string; alt: string }[]>([]);
const metaItems = ref<PersonMetaItem[]>([]);

const personInfo = computed<V1PersonInfo | null>(() => details.value?.Person ?? null);

const filmographyItems = computed<SearchItemViewModel[]>(() =>
  (details.value?.Contents ?? []).map(content => SearchContentFactory.mapPersonContentToViewModel(content))
);

type PersonMetaItem = {
  id: 'created';
  label: string;
  value: string;
  icon: Component;
};

onMounted(async () => {
  isDataReady.value = false;

  try {
    details.value = await personService.getById(personId.value);

    const person = details.value.Person;
    albumImages.value = (person.AdditionalImages ?? []).map((image, index) => ({
      src: resolveBackendImageLink(image.ImageLink),
      alt: `${person.Name} #${index + 1}`,
    }));

    metaItems.value = getMetaItemsFromPerson(person);
  } catch (error) {
    console.error('Failed to load person details', error);
  } finally {
    isDataReady.value = true;
  }
});

watch(() => route.params.id, async (newId) => {
  personId.value = resolveRoutePersonId(newId);
  isDataReady.value = false;

  try {
    details.value = await personService.getById(personId.value);

    const person = details.value.Person;
    albumImages.value = (person.AdditionalImages ?? []).map((image, index) => ({
      src: resolveBackendImageLink(image.ImageLink),
      alt: `${person.Name} #${index + 1}`,
    }));

    metaItems.value = getMetaItemsFromPerson(person);
  } catch (error) {
    console.error('Failed to load person details', error);
  } finally {
    isDataReady.value = true;
  }
});

function resolveRoutePersonId(routeParam: unknown = route.params.id): string {
  if (Array.isArray(routeParam)) {
    return String(routeParam[0] ?? '');
  }

  return String(routeParam ?? '');
}

function getMetaItemsFromPerson(person: V1PersonInfo): PersonMetaItem[] {
  const createDate = formatDate(person.CreatedAt);
  if (!createDate) {
    return [];
  }

  return [{
    id: 'created',
    label: 'Создано',
    value: createDate,
    icon: CalendarIcon,
  }];
}

function formatDate(value: number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = normalizeTimestampToMs(value);
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function normalizeTimestampToMs(value: number): number {
  return value < 1_000_000_000_000 ? value * 1000 : value;
}

function openReportModal() {
  if (!user.loggedIn) {
    eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error);
    return;
  }

  isReportModalOpen.value = true;
}

function closeReportModal() {
  isReportModalOpen.value = false;
}
</script>

<style scoped lang="scss">
.person {
  display: grid;
  margin: 20px 0;
  gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: 255px 1fr;
  }

  &__sidebar {
    min-width: 0;
    width: 100%;
  }

  &__icons-box {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  &__icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 56px;
    min-width: 56px;
    width: 100%;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    color: var(--primary20);
    background: white;
    cursor: pointer;

    &:hover {
      background: var(--primary90);
      color: var(--primary10);
    }
  }

  &__action-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__action-icon :deep(svg) {
    width: 18px;
    height: 18px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__filmography {
    display: flex;
    flex-direction: column;
  }

  &__filmography-grid {
    width: 100%;
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    grid-auto-flow: row;

    :deep(.search-item__image-box-1) {
      height: 220px;
    }

    :deep(.search-item__details-box) {
      gap: 6px;
      padding: 12px;
    }

    :deep(.search-item__title) {
      font-size: 16px;
      line-height: 22px;
    }

    :deep(.search-item__description) {
      font-size: 12px;
      line-height: 16px;
      -webkit-line-clamp: 1;
    }

    :deep(.search-item__tags-box) {
      padding: 10px;
    }

    :deep(.search-item__tag) {
      padding: 2px 6px;
    }

    :deep(.search-item__favorite-button) {
      margin: 8px;
      padding: 6px;
    }

    :deep(.search-item__favorite-icon) {
      width: 16px;
      height: 16px;
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
  }

  &__meta-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 4px;
    border-bottom: 1px solid #EEEFF4;

    &:first-child {
      padding-top: 4px;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 4px;
    }
  }

  &__meta-item--stacked {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  &__meta-main {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__meta-icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    color: var(--primary40);
    flex-shrink: 0;
  }

  &__meta-icon :deep(svg) {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
  }

  &__meta-label {
    color: #969BAB;
    margin: 0;
    white-space: nowrap;
  }

  &__meta-value {
    margin: 0;
    text-align: left;
    padding-left: 24px;
    overflow-wrap: anywhere;
  }
}
</style>

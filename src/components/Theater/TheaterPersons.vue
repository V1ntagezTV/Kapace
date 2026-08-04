<template>
  <div class="theater-persons">
    <div ref="gridRef" class="theater-persons__grid">
      <article
        v-for="(person, index) in visiblePersons"
        :key="person.PersonId"
        class="theater-persons__card"
        :class="{
          'theater-persons__card--expand': isExpandPreview(index),
          'theater-persons__card--clickable': !isExpandPreview(index),
        }"
        @click="onPersonClick(index, person.PersonId)"
      >
        <div class="theater-persons__image-wrapper">
          <img
            class="theater-persons__image"
            :src="resolveBackendImageLink(person.ImageLink)"
            :alt="person.Name"
            @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
          >

          <div
            v-if="!isExpandPreview(index)"
            class="theater-persons__overlay"
          >
            <div class="theater-persons__info">
              <p class="label-large theater-persons__name">
                {{ person.Name }}
              </p>

              <p
                v-if="hasCharacterName(characterName(person))"
                class="label-small theater-persons__character"
              >
                {{ characterName(person) }}
              </p>
            </div>
          </div>

          <div
            v-if="isExpandPreview(index)"
            class="theater-persons__more-overlay"
          >
            <span class="theater-persons__more-label">+{{ hiddenCount }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { resolveBackendImageLink } from '@/helpers/ImageLinkResolver';
import type { V1GetFullContentPerson } from '@/api/Responses/V1GetFullContentResponse';
import { getActorCharacterName } from '@/helpers/personRoles';

const props = defineProps<{
  persons: V1GetFullContentPerson[];
}>();

const router = useRouter();

const persons = toRef(props, 'persons');
const gridRef = ref<HTMLElement | null>(null);
const columnsCount = ref(0);
const isExpanded = ref(false);
const maxRows = 1;
let resizeObserver: ResizeObserver | null = null;

const visiblePersons = computed(() => {
  const total = persons.value.length;
  const cols = columnsCount.value;

  if (cols === 0 || isExpanded.value) {
    return persons.value;
  }

  const maxSlots = cols * maxRows;
  if (total <= maxSlots) {
    return persons.value;
  }

  return persons.value.slice(0, maxSlots);
});

const hiddenCount = computed(() => {
  if (isExpanded.value || columnsCount.value === 0) {
    return 0;
  }

  const maxSlots = columnsCount.value * maxRows;
  if (persons.value.length <= maxSlots) {
    return 0;
  }

  return persons.value.length - maxSlots;
});

function isExpandPreview(index: number): boolean {
  return !isExpanded.value
    && hiddenCount.value > 0
    && index === visiblePersons.value.length - 1;
}

function onPersonClick(index: number, personId: number) {
  if (isExpandPreview(index)) {
    expandPersons();
    return;
  }

  router.push({ name: 'person', params: { id: personId } });
}

function updateColumnCount() {
  if (!gridRef.value) {
    return;
  }

  const style = window.getComputedStyle(gridRef.value);
  const gridTemplate = style.getPropertyValue('grid-template-columns');
  if (!gridTemplate || gridTemplate === 'none') {
    return;
  }

  const count = gridTemplate.split(' ').length;
  if (count > 0 && count !== columnsCount.value) {
    columnsCount.value = count;
  }
}

function expandPersons() {
  isExpanded.value = true;
}

function characterName(person: V1GetFullContentPerson): string | null {
  return getActorCharacterName(person.Roles);
}

function hasCharacterName(characterName: string | null | undefined): boolean {
  return characterName != null && characterName.trim().length > 0;
}

onMounted(() => {
  updateColumnCount();

  resizeObserver = new ResizeObserver(() => {
    window.requestAnimationFrame(updateColumnCount);
  });

  if (gridRef.value) {
    resizeObserver.observe(gridRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.theater-persons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    width: 100%;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;

    &:not(&--expand):hover .theater-persons__image {
      transform: scale(1.02);
    }

    &--expand {
      cursor: pointer;

      &:hover .theater-persons__image {
        transform: scale(1.02);
      }
    }

    &--clickable {
      cursor: pointer;
    }
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background-color: var(--primary90);
    border-radius: 16px;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease;
  }

  &__overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 24px 10px 10px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.55) 55%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    margin: 0;
    width: 100%;
    text-align: left;
    color: #fff;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  &__character {
    margin: 0;
    width: 100%;
    text-align: left;
    color: rgba(255, 255, 255, 0.82);
    font-size: 11px;
    line-height: 13px;
    overflow-wrap: anywhere;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__more-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    border-radius: 16px;
    pointer-events: none;
  }

  &__more-label {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
  }
}
</style>

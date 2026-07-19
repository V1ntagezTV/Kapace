<template>
  <div ref="rootRef" class="year-range">
    <filter-chips
      class="year-range__trigger fit-content m3-bg-1 m-radius-circle m-border m-border-hover"
      :text="label"
      :enable-menu-icon="true"
      @click="toggleMenu"
    >
      <template #menu-icon>
        <material-drop-arrow />
      </template>
    </filter-chips>

    <div v-show="isDropped" class="year-range__menu m3-bg-1 m-radius-1">
      <div class="year-range__inputs">
        <label class="year-range__field">
          <input
            v-model="draftYearFrom"
            class="year-range__input m-radius-1 m-border m-border-active"
            type="number"
            inputmode="numeric"
            :min="minYear"
            :max="maxYear"
            :placeholder="minYear"
          >
        </label>

        <span class="year-range__divider">—</span>

        <label class="year-range__field">
          <input
            v-model="draftYearTo"
            class="year-range__input m-radius-1 m-border m-border-active"
            type="number"
            inputmode="numeric"
            :min="minYear"
            :max="maxYear"
            :placeholder="maxYear"
          >
        </label>
      </div>

      <div class="year-range__actions">
        <base-button
          class="m-radius-circle" variant="outline"
          @click="reset"
        >
          Сбросить
        </base-button>
        <base-button
          class="m-radius-circle" variant="filled"
          @click="apply"
        >
          Применить
        </base-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";

const props = defineProps({
  yearFrom: {type: Number, default: null},
  yearTo: {type: Number, default: null},
  minYear: {type: Number, default: 1980},
  maxYear: {type: Number, default: () => new Date().getFullYear()},
});

const emits = defineEmits<{
  (event: 'apply', value: {yearFrom: number | null, yearTo: number | null}): void,
}>();

const rootRef = ref<HTMLElement | null>(null);
const isDropped = ref(false);
const draftYearFrom = ref(toDraftValue(props.yearFrom));
const draftYearTo = ref(toDraftValue(props.yearTo));

const label = computed(() => {
  if (props.yearFrom != null && props.yearTo != null) {
    return `Годы: ${props.yearFrom}–${props.yearTo}`;
  }

  if (props.yearFrom != null) {
    return `Годы: от ${props.yearFrom}`;
  }

  if (props.yearTo != null) {
    return `Годы: до ${props.yearTo}`;
  }

  return "Годы";
});

watch(
  () => [props.yearFrom, props.yearTo],
  ([yearFrom, yearTo]) => {
    draftYearFrom.value = toDraftValue(yearFrom);
    draftYearTo.value = toDraftValue(yearTo);
  },
);

onMounted(() => document.addEventListener("pointerdown", onDocumentPointerDown, true));
onUnmounted(() => document.removeEventListener("pointerdown", onDocumentPointerDown, true));

function toggleMenu() {
  isDropped.value = !isDropped.value;
}

function apply() {
  emits("apply", {
    yearFrom: parseYear(draftYearFrom.value),
    yearTo: parseYear(draftYearTo.value),
  });
  isDropped.value = false;
}

function reset() {
  draftYearFrom.value = "";
  draftYearTo.value = "";
  emits("apply", {yearFrom: null, yearTo: null});
  isDropped.value = false;
}

function parseYear(value: string): number | null {
  if (!value) {
    return null;
  }

  const year = Number(value);
  return Number.isInteger(year) && year >= props.minYear && year <= props.maxYear
    ? year
    : null;
}

function toDraftValue(value: number | null): string {
  return value == null ? "" : String(value);
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node | null;
  if (!isDropped.value || !target || rootRef.value?.contains(target)) {
    return;
  }

  isDropped.value = false;
  draftYearFrom.value = toDraftValue(props.yearFrom);
  draftYearTo.value = toDraftValue(props.yearTo);
}
</script>

<style lang="scss" scoped>
.year-range {
  position: relative;
  flex: 0 0 auto;

  &__trigger {
    height: 48px;
  }

  &__menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    width: 340px;
    padding: 16px;
    border: 1px solid var(--outline-variant-light);
    box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.15),
                0 1px 2px 0 rgba(0, 0, 0, 0.15);
  }

  &__title {
    margin: 0 0 12px;
  }

  &__inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: end;
    gap: 8px;
  }

  &__field {
    display: grid;
    gap: 4px;
  }

  &__input {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    background: var(--surface-container-lowest100);
    outline: none;
  }

  &__divider {
    padding-bottom: 12px;
  }

  &__error {
    margin: 8px 0 0;
    color: var(--warning-red);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .year-range__menu {
    width: min(340px, calc(100vw - 32px));
  }
}
</style>

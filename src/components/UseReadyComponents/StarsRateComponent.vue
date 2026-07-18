<template>
  <div class="v__center row gap-16">
    <base-background :type="2" class="column h__center padding-16 h__fill v__fill">
      <div class="column h__fill v__fill h__center m-radius-8">
        <p class="headline-small">
          {{ props.userRate > 0 ? props.userRate + " / " : "" }}{{ props.stars.toFixed(2) }}
        </p>
        <div class="row h__center v__center">
          <template v-for="starIndex in 5" :key="starIndex">
            <icon-button
              v-if="(props.stars - starIndex) >= 0"
              :class="{'orange': starIndex <= hoverIndex}"
              @mouseover="() => hoverIndex = starIndex"
              @mouseleave="() => hoverIndex = props.userRate"
              @click="() => {
                hoverIndex = starIndex;
                clickOnStar(starIndex);
              }"
            >
              <heart-filled-icon />
            </icon-button>
            <icon-button
              v-else
              :class="{'orange': starIndex <= hoverIndex}"
              @mouseover="() => hoverIndex = starIndex"
              @mouseleave="() => hoverIndex = props.userRate"
              @click="() => {
                hoverIndex = starIndex;
                clickOnStar(starIndex);
              }"
            >
              <heart-empty-icon />
            </icon-button>
          </template>
        </div>
        <p class="label-medium">
          (Всего оценок: {{ formatRateCount(allCounters) }})
        </p>
      </div>
    </base-background>

    <base-background :type="2" class="fill padding-16 stars-table">
      <template v-for="(value, index) in rates" :key="index">
        <div class="stars-box row v__center">
          <span class="stars-rating row v__center gap-8">
            <star-icon class="stars-star" />
            <span class="body-small">{{ Math.abs(index - 5) }}</span>
          </span>
          <div class="stars-track">
            <div
              class="stars-fill row v__center"
              :class="{ 'stars-fill--full': calculatePercentage(value) >= 100 }"
              :style="{ width: calculatePercentage(value) + '%' }"
            >
              <span class="stars-value body-small">
                {{ formatRateCount(value) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </base-background>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import HeartEmptyIcon from "@/components/Icons/HeartEmptyIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartFilledIcon from "@/components/Icons/HeartFilledIcon.vue";
import StarIcon from "@/components/Icons/StarIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";

const props = defineProps({
  stars:    {type: Number, required: true},
  userRate: {type: Number, required: true},
  one:      {type: Number, required: true},
  two:      {type: Number, required: true},
  three:    {type: Number, required: true},
  four:     {type: Number, required: true},
  five:     {type: Number, required: true},
});

const emits = defineEmits<{(emitName: 'on:click-star', starIndex: number) : void}>();
const hoverIndex = ref<number>(props.userRate);
const allCounters = computed(() => props.one + props.two + props.three + props.four + props.five);
const rates = computed(() => [props.five, props.four, props.three, props.two, props.one]);

function calculatePercentage(value: number) : number {
  if (allCounters.value === 0) {
    return 0;
  }

  return (value / allCounters.value) * 100;
}

function clickOnStar(starIndex: number) {
  emits('on:click-star', starIndex);
}

function formatRateCount(value: number): string {
  if (value >= 1_000_000) {
    return `${Math.floor(value / 1_000_000)}кк`;
  }

  if (value >= 1_000) {
    return `${Math.floor(value / 1_000)}k`;
  }

  return value.toString();
}
</script>

<style scoped lang="scss">
.stars-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stars {
  &-box {
    min-width: 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--primary90);
  }

  &-rating {
    flex-shrink: 0;
    align-self: stretch;
    padding: 4px 8px;
    background: var(--primary40);
    color: var(--on-primary-light);
  }

  &-track {
    flex: 1;
    min-width: 0;
    align-self: stretch;
    overflow: hidden;
    background: var(--primary90);
  }

  &-fill {
    box-sizing: border-box;
    justify-content: flex-end;
    min-width: max-content;
    height: 100%;
    padding: 4px 8px;
    background: var(--primary50);
    border-radius: 0 8px 8px 0;

    &--full {
      border-radius: 0;
    }
  }

  &-star {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--on-primary-light);
  }

  &-value {
    flex-shrink: 0;
    color: #fff;
    white-space: nowrap;
  }
}

.orange {
  color: orange;
}

.icon-color {
  color: var(--primary40);
}
</style>
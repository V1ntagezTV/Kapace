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

    <base-background :type="2" class="fill padding-20 stars-table">
      <template v-for="(value, index) in rates" :key="index">
        <div class="stars-box">
          <span class="stars-tag stars-rating row v__center gap-8">
            <star-icon class="stars-star" />
            <span class="body-small">{{ Math.abs(index - 5) }}</span>
          </span>
          <div class="stars-progress m-radius-16">
            <div
              :style="{width: (calculatePercentage(value)) + '%'}"
              class="line-filled m-radius-16"
            />
          </div>
          <span class="stars-tag stars-value row v__center">
            <span class="body-small">{{ formatRateCount(value) }}</span>
          </span>
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
const onePercent = computed(() => 100 / allCounters.value);
const rates = computed(() => [props.five, props.four, props.three, props.two, props.one]);

function calculatePercentage(value: number) : number {
  return allCounters.value === 0 ? 0 : onePercent.value * value;
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
  display: grid;
  align-items: center;
  column-gap: 8px;
  row-gap: 4px;
  grid-template-columns: min-content minmax(0, 1fr) max-content;
  grid-auto-flow: row;
}

.stars {
  &-box {
    display: contents;
  }

  &-tag {
    background: var(--primary-container-light);
    border-radius: 8px;
    padding: 4px 8px;
    width: 100%;
    justify-content: right;
    overflow: hidden;
    gap: 8px;
  }

  &-rating {
    width: fit-content;
  }

  &-star {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--on-primary-container-light);
  }

  &-value {
    justify-self: end;
    white-space: nowrap;
  }
}

.stars-progress {
  width: 100%;
  height: 6px;
  min-width: 0;
  overflow: hidden;
  background-color: var(--primary90);
}

.line-filled {
  background-color: var(--primary40);
  height: 100%;
}

.orange {
  color: orange;
}

.icon-color {
  color: var(--primary40);
}
</style>
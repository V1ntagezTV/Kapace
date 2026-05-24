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

    <base-background :type="2" class="fill column padding-20">
      <template v-for="(value, index) in rates" :key="index">
        <div class="stars-box h__fill h__center v__center gap-8">
          <p class="stars-num row v__center fit-content">
            {{ Math.abs(index - 5) }}
          </p>
          <heart-filled-icon class="orange" />
          <div class="stars-progress m-radius-16">
            <div
              :style="{width: (calculatePercentage(value)) + '%'}"
              class="line-filled m-radius-16"
            />
          </div>
          <p class="stars-value">
            {{ formatRateCount(value) }}
          </p>
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
.stars {
  &-box {
    display: grid;
    width: 100%;
    align-items: center;
    grid-template-columns: min-content 20px minmax(0, 1fr) 36px;
    grid-auto-flow: row;
  }

  &-num {
    padding-top: 2px;
    justify-content: flex-end;
  }

  &-value {
    text-align: right;
    white-space: nowrap;
  }
}

.stars-progress {
  width: 100%;
  height: 4px;
  min-width: 0;
  overflow: hidden;
  background-color: var(--primary80);
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
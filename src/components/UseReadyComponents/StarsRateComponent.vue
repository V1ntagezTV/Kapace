<template>
  <div class="v__center row gap-16">
    <base-background :type="2" class="column h__center padding-16 h__fill v__fill">
      <div class="column h__fill v__fill h__center m-radius-8">
        <p class="headline-small">
          {{ props.userRate > 0 ? props.userRate + " / ": "" }}{{ stars.toFixed(2) }}
        </p>
        <div class="row h__center v__center">
          <template v-for="starIndex in 5" :key="starIndex">
            <icon-button
              v-if="(stars - starIndex) >= 0"
              :class="{'orange': starIndex <= hoverIndex}"
              @mouseover="() => hoverIndex = starIndex"
              @mouseleave="() => hoverIndex = userRate"
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
              @mouseleave="() => hoverIndex = userRate"
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
          ({{ allCounters }})
        </p>
      </div>
    </base-background>

    <base-background :type="2" class="fill column padding-20">
      <template v-for="(value, index) in [five, four, three, two, one]" :key="value">
        <div class="stars-box h__fill h__center v__center gap-8">
          <p class="stars-num row v__center fit-content">
            {{ Math.abs(index - 5) }}
          </p>
          <heart-filled-icon class="orange" />
          <div class="row gap-8">
            <div
              v-show="calculatePercentage(value) > 0"
              :style="{width: (calculatePercentage(value)) + '%'}"
              class="line-filled h__fill m-radius-16"
            />
            <div
              :style="{width: (100 - calculatePercentage(value)) + '%'}"
              class="line-empty h__fill m-radius-16"
            />
          </div>
          <p>{{ value }}</p>
        </div>
      </template>
    </base-background>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import HeartEmptyIcon from "@/components/Icons/HeartEmptyIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartFilledIcon from "@/components/Icons/HeartFilledIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";
import {prop} from "vue-class-component";

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

function calculatePercentage(value: number) : number {
  return allCounters.value === 0 ? 0 : onePercent.value * value;
}

function clickOnStar(starIndex: number) {
  emits('on:click-star', starIndex);
}
</script>

<style scoped lang="scss">
.stars {
  &-box {
    display: grid;
    width: 100%;
    height: 100%;

    grid-template-columns: min-content max-content 1fr min-content;
    grid-auto-flow: row;
  }

  &-num {
    padding-top: 2px;
  }
}

.line-filled {
  background-color: var(--primary40);
  height: 4px;
}

.line-empty {
  background-color: var(--primary80);
  height: 4px;
}

.orange {
  color: orange;
}

.icon-color {
  color: var(--primary40);
}
</style>
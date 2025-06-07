<template>
  <base-background :type="2" class="v__center row">
    <div class="row v__center">
      <template v-for="index in 5" :key="index">
        <icon-button
          v-if="(currentRate - index) >= 0"
          :class="{'heart': index <= hoverIndex}"
          @mouseover="() => hoverIndex = index"
          @mouseleave="() => hoverIndex = userRate"
          @click="() => hoverIndex = index"
        >
          <heart-filled-icon />
        </icon-button>
        <icon-button
          v-else
          :class="{'heart': index <= hoverIndex}"
          @mouseover="() => hoverIndex = index"
          @mouseleave="() => hoverIndex = userRate"
          @click="() => hoverIndex = index"
        >
          <heart-empty-icon />
        </icon-button>
      </template>
    </div>

    <p class="body-medium">
      {{ currentRate.toFixed(2) }} / {{ props.userRate }}
    </p>
  </base-background>
</template>

<script setup lang="ts">
import {ref} from "vue";
import HeartEmptyIcon from "@/components/Icons/HeartEmptyIcon.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartFilledIcon from "@/components/Icons/HeartFilledIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";

const props = defineProps({
  currentRate: {type: Number, required: true},
  usersRatedCounter: {type: Number, required: true},
  userRate:  {type: Number, required: true}
});

const hoverIndex = ref<number>(props.userRate);
</script>

<style scoped lang="scss">
.heart {
  color: orange;
}
</style>
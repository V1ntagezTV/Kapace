<template>
  <div>
    <button
      class="filter-unit__header-button"
      @click="updateShow(!show)"
    >
      <p>{{ filter.name }}</p>
      <DropArrow class="filter-unit__arrow-icon" />
    </button>

    <transition name="content">
      <div v-if="show">
        <div
          v-for="([key, value], index) in inputValues"
          :key="index"
          class="filter-unit__input-container"
          @click="inputClick(key.toString(), value)"
        >
          <input :checked="value" type="checkbox">
          <label class="filter-unit__label">{{ key }} / {{ value }}</label>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref, watch} from 'vue'
import DropArrow from "@/components/Icons/DropArrow.vue";
import FilterUnitModel from "@/components/Search/Models/FilterUnitModel";
import {SearchEmits} from "@/components/Search/Models/SearchEmits";

const props = defineProps({
  show: {type: Boolean, default: true, required: false},
  filter: {type: Object as PropType<FilterUnitModel>, required: true},
});

const inputValues = ref(props.filter.values);
let show = ref(props.show);

watch(() => props.clearTrigger, () => {
  for (let key of  props.filter?.values.keys()) {
    inputValues.value.set(key, false);
  }
})

function updateShow(show: boolean) {
  this.show = show;
}

function inputClick(key: string, value: boolean) : void {
  inputValues.value.set(key, !value);
}

</script>

<style lang="scss">

.filter-unit {
  &__header-button {
    display: flex;
    justify-content: space-between;
    width: 250px;
    height: 40px;
    align-items: center;
    padding: 0 20px;
    border-width: 0;
    background: transparent;

    border-top: 1px solid #eaeaea;

    & p {
      font-weight: 600;
      letter-spacing: 1px;
      font-size: 14px;
      line-height: 17px;
      color: #474A57;
      padding: 0;
    }

    &:hover {
      cursor: pointer;
      color: var(--secondary);
      background: #F4F5F7;
    }
  }

  &__arrow-icon {
    height: 20px;
    width: 20px;
  }

  &__input-container {
    display: flex;
    padding: 6px 20px;
    align-items: center;
    justify-content: flex-start;

    &:hover {
      cursor: pointer;
      background: #F4F5F7;
    }
  }

  &__label {
    margin-left: 4px;
    font-weight: 400;
    font-size: 14px;
    text-align: left;
    letter-spacing: 0.02em;
    cursor: pointer;
    -webkit-user-select: none;
  }
}

.content {
  &-enter-from {
    opacity: 0;
  }

  &-enter-active {
    transition: opacity 0.5s ease;
  }

  &-enter-to {
    opacity: 100;
  }
}
</style>
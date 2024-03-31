<template>
  <div class="select-menu__box">
    <filter-chips
      ref="filterChips"
      :text="text"
      :enable-menu-icon="true"
      class="bg-2"
      @click="OnClickCloseMenu"
    >
      <template #menu-icon>
        <material-drop-arrow />
      </template>
    </filter-chips>

    <template v-if="isMenuShowed">
      <div
        class="select-menu__menu"
        :class="{'select-menu__menu select-menu__menu': isUnitSelected, }"
        @click="onClickSelect"
      >
        <template v-for="unit in props.list" :key="unit">
          <div class="select-menu__text-box">
            <p class="select-menu__text">
              {{ unit }}
            </p>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref} from "vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";

const isMenuShowed = ref<boolean>(false);
const isUnitSelected = ref<boolean>(false);
const filterChips = ref()

const props = defineProps({
  text: {type: String, required: true},
  list: {type: Object as PropType<Array<string>>, required: true}
});

function OnClickCloseMenu() {
  isMenuShowed.value = !isMenuShowed.value;
}

function onClickSelect() {
  isUnitSelected.value = true;
  isMenuShowed.value = false;
}
</script>

<style lang="scss" >
.select-menu {
  &__box {
    display: grid;
    justify-items: flex-end;
    gap: 8px;
  }

  &__menu {
    display: grid;
    grid-template-rows: auto;
    z-index: 999;

    height: fit-content;
    width: 200px;

    background: #FBF8FF;
    padding: 8px 0;
    border-radius: 4px;
    box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.15),
                0 1px 2px 0 rgba(0, 0, 0, 0.3);
  }

  &__menu-selected {
    border: 3px solid #525a92;
    border-radius: 4px;
  }

  &__text-box {
    display: grid;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap: 0;

    width: 200px;
    height: 40px;

    cursor: pointer;

    &:hover {
      background: rgba(73, 69, 79, 0.12);
    }
  }

  &__text {
    font-weight: 500;
    font-size: 14px;
    line-height: 150%;
    letter-spacing: 0.03em;
    color: #1b1b21;

    padding: 0 16px;
    margin: 0;
  }
}
</style>
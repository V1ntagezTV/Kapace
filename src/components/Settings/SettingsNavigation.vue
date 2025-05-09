<template>
  <div class="material settings-nav__container">
    <div class="settings-nav__category">
      <div class="settings-nav__label row gap-12 padding-8">
        <menu-icon />
      </div>

      <router-link
        :class="{'settings-nav__button-selected': refCurrent === SettingsPageTypes.Edits}"
        class="settings-nav__button m-radius-circle"
        to="/edit/list"
      >
        <folder-icon />
        <div v-show="!isMobile" class="text__one-line">
          Изменения
        </div>
      </router-link>
      <router-link
        :class="{'settings-nav__button-selected':
          refCurrent === SettingsPageTypes.EditContent ||
          refCurrent === SettingsPageTypes.CreateContent}"
        class="settings-nav__button m-radius-circle"
        :to="{name: 'create-content'}"
      >
        <add-note />
        <div v-show="!isMobile">
          Добавить контент
        </div>
      </router-link>
      <router-link
        :class="{'settings-nav__button-selected':
          refCurrent === SettingsPageTypes.EditEpisode ||
          refCurrent === SettingsPageTypes.CreateEpisode}"
        class="settings-nav__button m-radius-circle"
        :to="{name: 'create-episode'}"
      >
        <add-library-icon />
        <div v-show="!isMobile">
          Добавить эпизод
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import {SettingsPageTypes} from "@/models/SettingsPageTypes";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import MenuIcon from "@/components/Icons/MenuIcon.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import AddNote from "@/components/Icons/AddNote.vue";
import AddLibraryIcon from "@/components/Icons/AddLibraryIcon.vue";
import IconButton from "@/components/Base/Buttons/IconButton.vue";

const props = defineProps({
  current: {type: SettingsPageTypes, required: true}
});

const screenWidth = ref(window.innerWidth)
const refCurrent = ref<SettingsPageTypes>(props.current);
const isMobile = computed(() => screenWidth.value <= 720)

watch(() => props.current, (newValue) => {
  refCurrent.value = newValue;
});

const handleResize = () => {screenWidth.value = window.innerWidth}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

</script>

<style scoped lang="scss">
.settings-nav {
  &__container {
    display: grid;
    grid-template-rows: min-content;
    height: fit-content;
    background: var(--surface-container-lowest100);
    margin-top: 20px;
    padding: 12px;
    border-radius: 16px;
  }

  &__vertical-splitter {
    width: 100%;
    height: 1px;
    background: var(--font-gray-v2);
  }

  &__label {
    display: flex;
    height: 56px;

    text-align: start;
    align-items: center;
    padding-left: 16px;
  }

  &__category {
    display: flex;
    height: fit-content;
    align-items: stretch;
    text-align: start;
  }

  &__button {
    display: flex;
    height: 56px;

    padding-left: 16px;
    padding-right: 16px;
    justify-content: start;
    align-items: center;
    gap: 12px;
    transition: background-color 0.25s;

    color: var(--on-surface-variant-light);

    &-selected {
      color: var(--on-secondary-container-light);
      background: var(--secondary-container-light);
    }

    &:hover {
      cursor: pointer;
      color: var(--on-secondary-container-light);
      background: var(--secondary-container-light);
    }
  }



  &__category-box {
    display: grid;
    padding-bottom: 10px;
  }
}
</style>
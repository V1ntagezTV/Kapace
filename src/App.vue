<template>
  <div class="material wrapper">
    <div class="primary-header__background" />
    <PrimaryHeader class="primary-header__grid" />

    <router-view class="body__grid" />
    <div class="event__box gap-8">
      <auto-hide
        v-for="event in events"
        :key="event"
      >
        <base-background
          v-if="event.eventType === EventTypes.Info"
          :type="2"
          class="event__unit-info event__unit body-medium m3-bg-1 m-radius-1"
        >
          {{ event.text }}
        </base-background>

        <base-background
          v-else-if="event.eventType === EventTypes.Success"
          :type="2"
          class="event__unit-success event__unit body-medium m3-bg-1 m-radius-1"
        >
          {{ event.text }}
        </base-background>

        <base-background
          v-else-if="event.eventType === EventTypes.Error"
          :type="2"
          class="event__unit-error event__unit body-medium m3-bg-1 m-radius-1"
        >
          {{ event.text }}
        </base-background>
      </auto-hide>
    </div>
    <base-button @click="() => {clientEventStore.push('СООБЩЕНИЕ', EventTypes.Success)}">push message</base-button>
  </div>
</template>

<script setup>
import {TranslationService} from './api/TranslationService';
import PrimaryHeader from './components/Headers/PrimaryHeader.vue';
import {ContentService} from "@/api/ContentService";
import {computed, provide} from "vue";
import {ImageService} from "@/api/ImageService";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {EpisodeService} from "@/api/EpisodeService";
import {TranslatorService} from "@/api/TranslatorService";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import AutoHide from "@/components/AutoHide.vue";
import {GenreService} from "@/api/GenreService";
import BaseButton from "@/components/Base/BaseButton.vue";

provide('content-service', new ContentService());
provide('translation-service', new TranslationService());
provide('image-service', new ImageService());
provide('changes-history-service', new ChangesHistoryService());
provide('episode-service', new EpisodeService());
provide('translator-service', new TranslatorService());
provide('genre-service', new GenreService());

const clientEventStore = new ClientEventStore();
const events = computed(() => clientEventStore.$state.events);
</script>

<style lang="scss">
@import "@/assets/styles/mstyles.scss";
@import "@/assets/styles/custombootstrap.scss";
@import url('https://fonts.googleapis.com/css?family=Roboto');
@import url(@/assets/styles/token.css);

:root {
  background: #F5F2FA;
  --primary: #577399;
  --light-primary: #BDD5EA;
  --dark-primary: #495867;
  --secondary: #FF776F;
  --warning-red: #d20000;
  --white: #F7F7FF;

  --font-black: #18191F;
  --font-gray: #474A57;
  --font-light-black: #222222;
  --font-gray-v1: #D9DBE1;
  --font-gray-v2: #EEEFF4;
  --font-gray-v3: #F4F5F7;

  --header-static-text: #9D9D9D;
  --header-hover-text: #577399;

  --font-gray-v4: #969BAB;

  --placeholder: #999;
}

* {
  box-sizing: border-box;
  a {
    color: var(--dark-primary);
    text-decoration: none;
  }
  
  * {
    padding: 0;
    margin: 0;
  }

  button {
    text-decoration: none;
    border: none;
    outline: none;
    background: none;
    padding: 0;
    margin: 0;
  }
}

#app {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.material {
  font-family: 'Roboto', sans-serif;
}

.wrapper {
  margin: 0;
  height: 100%;
  min-width: 1120px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 20px 1200px 20px 1fr;
  grid-template-rows: 56px auto;
}

.header-grid {
  grid-column: 1 / 6;
  grid-row: 1 / 1;
}

.body__grid {
  height: 100%;
  width: 100%;
  grid-column: 3 / 3;
  grid-row: 2 / 2;
}

.primary-header__grid {
  top: 0;
  position: sticky;
  z-index: 9999;
  grid-column: 3 / 3;
  grid-row: 1 / 1;
}

.primary-header__background {
  top: 0;
  position: sticky;
  z-index: 9999;
  grid-column: 1 / 6;
  grid-row: 1 / 1;
  background: #303036;
  height: 100%;
}

.event {
  &__box {
    display: flex;
    width: fit-content;
    height: fit-content;
    flex-direction: column;
    top: 40px;
    justify-self: end;

    padding: 20px 0;
    gap: 8px;
    position: sticky;
    grid-column: 3 / 3;
    grid-row: 2 / 2;
  }

  &__unit {
    display: flex;
    align-items: center;

    padding: 12px 16px;
    width: 344px;
    height: fit-content;
    text-align: start;
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px 3px rgba(0, 0, 0, 0.15);

    &-info {
      background: #303036;
      color: white;
    }

    &-success {
      color: white;
      background: #4f9d00;
    }

    &-error {
      background: #BA1A1A;
      color: white;
    }
  }
}
</style>

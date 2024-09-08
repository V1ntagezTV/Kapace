<template>
  <div class="wrapper">
    <div class="primary-header__background" />
    <PrimaryHeader class="primary-header__grid" />

    <div class="secondary-header__background" />
    <SecondaryHeader class="secondary-header__grid" />

    <router-view class="body__grid" />
  </div>
</template>

<script setup>
import {TranslationService} from './api/TranslationService';
import PrimaryHeader from './components/Headers/PrimaryHeader.vue';
import SecondaryHeader from './components/Headers/SecondaryHeader.vue';
import {ContentService} from "@/api/ContentService";
import {provide} from "vue";
import {ImageService} from "@/api/ImageService";
import {ChangesHistoryService} from "@/api/ChangesHistoryService";
import {EpisodeService} from "@/api/EpisodeService";
import {TranslatorService} from "@/api/TranslatorService";

provide('content-service', new ContentService());
provide('translation-service', new TranslationService());
provide('image-service', new ImageService());
provide('changes-history-service', new ChangesHistoryService());
provide('episode-service', new EpisodeService());
provide('translator-service', new TranslatorService());
</script>

<style lang="scss">
@import "@/assets/styles/mstyles.scss";
@import "@/assets/styles/custombootstrap.scss";
@import url('https://fonts.googleapis.com/css?family=Roboto');
@import url(@/assets/styles/token.css);
@import url(@/assets/styles/typography.module.css);
@import url(@/assets/styles/elevation.css);

:root {
  background: #F2EFF7;
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
  
  p {
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
  color: #474a57;
}

.wrapper {
  margin: 0;
  height: 100vh;
  min-width: 1120px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 20px 1200px 20px 1fr;
  grid-template-rows: 46px 46px auto;
}

.header-grid {
  grid-column: 1 / 6;
  grid-row: 1 / 1;
}

.body__grid {
  height: 100%;
  width: 100%;
  grid-column: 3 / 3;
  grid-row: 3 / 3;
}

.primary-header__grid {
  grid-column: 3 / 3;
  grid-row: 1 / 1;
}

.primary-header__background {
  grid-column: 1 / 6;
  grid-row: 1 / 1;
  background: linear-gradient(269.43deg, #577399 68.83%, #112D3D 121.29%);
  height: 100%;
}

.secondary-header__grid {
  top: 0;
  position: sticky;
  z-index: 999;
  grid-column: 3 / 3;
  grid-row: 2;
}

.secondary-header__background {
  top: 0;
  position: sticky;

  grid-column: 1 / 6;
  grid-row: 2 / 2;
  background:white;
  height: 100%;
}
</style>

<template>
  <BaseBackground :type="2" class="content-details__details">
    <div class="content-details__title-main">
      <div class="content-details__title-primary">
        <h1 class="content-details__title">
          {{ contentDetails.title }}
        </h1>

        <HeartSVG
          :is-selected="isInFavorite"
          class="content-details__icon-style"
          @click="heartOnClick()"
        />
      </div>

      <div class="content-details__title-secondary">
        <p class="content-details__title-rating">
          {{ contentDetails.importStars }}
        </p>
        <p>{{ contentDetails.country }}</p>
        <p>{{ moment(new Date(contentDetails.releasedAt)).format('YYYY') }}</p>
        <p v-if="contentDetails.genres.length > 0">
          {{ contentDetails.genres[0]?.name ?? "123" }}
        </p>
        <p>{{ '+' + contentDetails.minAgeLimit }}</p>
      </div>
    </div>

    <div class="content-details__splitter" />

    <div v-if="tags.length > 0" class="content-details__tags-main">
      <div class="content-details__tags-column">
        <template
          v-for="[name, value] in tags"
          :key="name"
        >
          <div v-if="value % 2 === 0" class="content-details__tag">
            <p class="content-details__tag-name">
              {{ name }}
            </p>
            <p class="content-details__tag-value">
              {{ value }}
            </p>
          </div>
        </template>
      </div>

      <div class="content-details__tags-column">
        <template
          v-for="[name, value] in tags"
          :key="name"
        >
          <div v-if="value % 2 === 1" class="content-details__tag">
            <p class="content-details__tag-name">
              {{ name }}
            </p>
            <p class="content-details__tag-value">
              {{ value }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <div>
      <p class="content-details__description">
        {{ contentDetails.description }}
      </p>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import moment from 'moment'
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartSVG from "@/components/Icons/HeartSVG.vue";
import {inject, onMounted, ref} from 'vue';
import {ContentService} from "@/api/ContentService";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {V1GetMainPageContentResponse} from "@/api/Responses/V1GetMainPageContentResponse";

const contentService: ContentService = inject("content-service");

let content: V1GetMainPageContentResponse = ref(null);
let details: V1GetFullContentResponse = ref(null);

onMounted(async() => {
  details = await contentService.V1GetFullContentAsync(1, 1);
})

const tags = getTagsFromDetails(details);
let isInFavorite = ref<boolean>(true);

function heartOnClick() {
    /*
  props.details.contentInfoToUser.isInFavourite = !props.details.contentInfoToUser.isInFavourite;
  isInFavorite.value = !isInFavorite.value;
     */
}
function getTagsFromDetails(details: V1GetFullContentResponse): {[key: string]: string} {
  if (details == null) {
      return {}
  }

  const formattedDuration = `${(details.duration / 60)}:${details.duration % 60}`;

  return {
    "Время:": formattedDuration,
    "Добавил:": formattedDuration
  };
}
</script>

<style lang="scss" scoped>
.content-details {
  &__description {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    text-align: justify;
    letter-spacing: 0.04em;
    margin: 0;
  }

  &__title {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    text-align: left;
    padding: 0;
    margin: 0;
  }

  &__title-primary {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }

  &__title-secondary {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    color: var(--font-gray-v4);
    font-weight: 700;
    font-size: 14px;

    & p {
      margin: 0;
    }
  }

  &__title-rating {
    background: var(--secondary);
    color: #FFF;
    padding: 4px;
    border-radius: 4px;
  }

  &__main {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    padding: 20px 0;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    padding: 20px;
  }

  &__title-main {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }

  &__icon-style {
    color: var(--primary);

    &:hover {
      cursor: pointer;
      color: var(--secondary);
    }
  }

  &__splitter {
    height: 2px;
    width: 100%;
    border: 1px solid #EEEFF4;
  }

  &__tags-main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__tags-column {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  &__tag {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  &__tag-name {
    display: flex;
    color: #969BAB;
    margin: 0;
  }

  &__tag-value {
    margin: 0;
  }
}
</style>
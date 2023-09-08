<template>
  <BaseBackground :type="2" class="content-details__details">
    <div class="content-details__title-main">
      <div class="content-details__title-primary">
        <h1 class="content-details__title">
          {{ props.details.Title }}
        </h1>

        <HeartSVG
          :is-selected="isInFavorite"
          class="content-details__icon-style"
          @click="heartOnClick()"
        />
      </div>

      <div class="content-details__title-secondary">
        <p v-if="props.details.ImportStars >= 1" class="content-details__title-rating">
          {{ props.details.ImportStars }}
        </p>
        <p>{{ props.details.Country }}</p>
        <p>{{ moment(new Date(details.ReleasedAt)).format('YYYY') }}</p>
        <p v-if="props.details.Genres?.length > 0">
          {{ props.details.Genres[0]?.Name ?? "123" }}
        </p>
        <p v-if="props.details.MinAgeLimit > 0">
          {{ props.details.MinAgeLimit + '+' }}
        </p>
      </div>
    </div>

    <div class="content-details__splitter" />

    <div class="content-details__tags-main">
      <div class="content-details__tags-column">
        <template
          v-for="([key, value], index) in tags"
          :key="index"
        >
          <div v-if="index % 2 === 0" class="content-details__tag">
            <p class="content-details__tag-name">
              {{ key }}
            </p>
            <p class="content-details__tag-value">
              {{ value }}
            </p>
          </div>
        </template>
      </div>

      <div class="content-details__tags-column">
        <template
          v-for="([key, value], index) in tags"
          :key="index"
        >
          <div v-if="index % 2 === 1" class="content-details__tag">
            <p class="content-details__tag-name">
              {{ key }}
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
        {{ details.Description }}
      </p>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import moment from 'moment'
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartSVG from "@/components/Icons/HeartSVG.vue";
import {PropType, ref} from 'vue';
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const props = defineProps({
  details: {type: Object as PropType<V1GetFullContentResponse>, required: true}
})

const tags = getTagsFromDetails(props.details);
let isInFavorite = ref<boolean>(true);

function heartOnClick() {
    /*
  props.details.contentInfoToUser.isInFavourite = !props.details.contentInfoToUser.isInFavourite;
  isInFavorite.value = !isInFavorite.value;
     */
}
function getTagsFromDetails(details: V1GetFullContentResponse) : Map<string, string | number> {
  if (details == null) {
      return new Map<string, string | number>();
  }

  const hoursStr = Math.floor(details.Duration / 60) > 0
    ? `${Math.floor(details.Duration / 60)}ч`
    : ""

  const minStr = details.Duration % 60 > 0 ? `${details.Duration % 60} мин` : '';
  const formattedDuration = `${hoursStr} ${minStr}`;

  const resultMap = new Map<string, string | number>();

  if (details.PlannedSeries > 0 && details.OutSeries > 0) {
    resultMap.set("Серий:", `${details.OutSeries}/${details.PlannedSeries}`);
  } else if (details.PlannedSeries == 0 && details.OutSeries > 0) {
    resultMap.set("Серий:", `${details.OutSeries}/10`);
  }

  const createdAtDate = moment(new Date(details.CreatedAt));
  resultMap.set("Создано:", createdAtDate.day() + ` ${months[createdAtDate.month() - 1]} ` + createdAtDate.format(`YYYY в HH:MM`));
  if (details.Views > 0) {
    resultMap.set("Просмотров:", details.Views);
  }
  const updatedAtDate = moment(new Date(details.LastUpdateAt));
  resultMap.set("Обновлено:", updatedAtDate.day() + ` ${months[updatedAtDate.month() - 1]} ` + updatedAtDate.format(`YYYY в HH:MM`));

  if (details.Duration) {
    resultMap.set("Время:", formattedDuration);
  }
  return resultMap;
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
    height: 24px;
    width: 24px;

    min-height: 24px;
    min-width: 24px;

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
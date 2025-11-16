<template>
  <BaseBackground :type="2" class="material content-details__details">
    <div class="content-details__title-main">
      <div class="row v__center row-dynamic gap-8 h__space-between">
        <div class="row v__center gap-8">
          <h1 class="headline-medium content-details__title">
            {{ details.Content.Title }}
          </h1>
          <HeartSVG
            :is-selected="isFavorite"
            class="content-details__icon-style"
            @click="emits('on:clickHeart')"
          />
        </div>
      </div>

      <h2 class="title-small content-details__title">
        {{ otherTitles(details) }}
      </h2>

      <div class="row row-dynamic gap-8">
        <filter-chips
          v-show="details.Content.Type"
          class="m3-bg-2"
          style="color: var(--primary40)"
          :text="(mapContentTypeToRuStr(details.Content.Type)).toString()"
        />
        <filter-chips
          v-show="details.Content.Status"
          class="m3-bg-2"
          style="color: var(--primary40)"
          :text="(mapContentStatusToRuStr(details.Content.Status)).toString()"
        />
        <filter-chips
          v-show="details.Content.ReleasedAt"
          class="m3-bg-2"
          style="color: var(--primary40)"
          :text="moment(new Date(details.Content.ReleasedAt)).format('YYYY')"
        />
        <filter-chips
          v-show="details.Content.Country !== undefined"
          class="m3-bg-2"
          style="color: var(--primary40)"
          :text="details.Content.Country.toString()"
        />
        <filter-chips
          v-show="details.Content.MinAgeLimit > 0"
          class="m3-bg-2"
          style="color: var(--primary40)"
          :text="details.Content.MinAgeLimit.toString()+'+'"
        />
      </div>
    </div>
    <div class="content-details__splitter" />
    <div>
      <p class="content-details__description">
        {{ details.Content.Description }}
      </p>
    </div>
    <div
      v-show="details.Genres?.length > 0"
      class="row row-dynamic gap-8"
    >
      <filter-chips
        v-for="genre in details.Genres"
        :key="genre"
        class="m3-bg-2"
        style="color: var(--primary40)"
        :text="genre.Name"
      />
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import moment from 'moment'
import BaseBackground from "@/components/Base/BaseBackground.vue";
import HeartSVG from "@/components/Icons/HeartSVG.vue";
import {defineEmits, inject, onMounted, PropType, ref, watch} from 'vue';
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import {mapContentStatusToRuStr} from "@/api/Enums/ContentStatus";
import {mapContentTypeToRuStr} from "@/api/Enums/ContentType";
import {FavoriteApi} from "@/api/FavoriteApi";
import {userStore} from "@/store/UserStore";
import {FavoriteStatus} from "@/models/FavoriteStatuses";
import HeartEmptyIcon from "@/components/Icons/HeartEmptyIcon.vue";
import StarsRateComponent from "@/components/UseReadyComponents/StarsRateComponent.vue";

const user = userStore();

const props = defineProps({
  details: {type: Object as PropType<V1GetFullContentResponse>, required: true},
  isFavorite: {type: Boolean, required: true, default: false}
});

const emits = defineEmits<{
  (emitName: 'on:clickHeart') : void
}>()

let isInFavorite = ref<boolean>(props.isFavorite);
watch(() => props.isFavorite, (newValue) => isInFavorite.value = newValue);

const otherTitles = (details: V1GetFullContentResponse) : string => {
  let otherTitleStr = "";
  if (details.Content.EngTitle) {
    otherTitleStr += details.Content.EngTitle;
  }
  if (details.Content.OriginTitle) {
    if (otherTitleStr === "") {
      otherTitleStr += details.Content.OriginTitle;
    } else {
      otherTitleStr += " / " + details.Content.OriginTitle;
    }
  }

  return otherTitleStr;
}


</script>

<style lang="scss" scoped>
.content-details {
  &__description {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    text-align: justify;
    letter-spacing: 0.04em;
    margin: 0;
  }

  &__title {
    text-align: left;
    padding: 0;
    margin: 0;
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
    gap: 16px;
    width: 100%;
    padding: 20px;
  }

  &__title-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
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


}
</style>
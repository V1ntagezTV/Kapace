<template>
  <div class="image-column__main">
    <BaseBackground :type="2">
      <div>
        <img
          class="image-column__image"
          :src="imageService.getImageLink(imageId, contentId)"
          @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
        />
      </div>
    </BaseBackground>

    <BaseButton v-if="firstEpisodeId > 0" :button-type="2">
      <router-link
        class="theater-videos__video-name"
        :to="{ name: 'episode', params: { episode: firstEpisodeId }}"
      >
        Начать просмотр
      </router-link>
    </BaseButton>

    <BaseDropMenu v-if="OptionsApi.HIDE_USER_ACTIVITIES">
      <template #header="{onClick}">
        <BaseButton
          class="image-column__drop-button"
          :button-type="1"
          @click="onClick"
        >
          Добавить в
          <drop-arrow />
        </BaseButton>
      </template>

      <template #menu="{ onClick }">
        <BaseBackground
          class="image-column__add-menu"
          :type="3"
          @click="onClick"
        >
          <BaseButton :button-type="3">
            Запланировано
          </BaseButton>
          <BaseButton :button-type="3">
            Избранное
          </BaseButton>
          <BaseButton :button-type="3">
            Брошено
          </BaseButton>
        </BaseBackground>
      </template>
    </BaseDropMenu>

    <BaseButton v-if="userInfo != null && userInfo.LastViewedSeries > 0" :button-type="3">
      Продолжить просмотр <br> с {{ props.userInfo.LastViewedSeries }}-ой серии
    </BaseButton>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, inject, PropType} from 'vue';
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import {V1GetFullContentUserInfo} from "@/api/Responses/V1GetFullContentResponse";
import BaseDropMenu from "@/components/Base/BaseDropMenu.vue";
import DropArrow from "@/components/Icons/DropArrow.vue";
import {StringExtensions} from "@/helpers/StringExtensions";
import {OptionsApi} from "@/options/OptionsApi";
import {ImageService} from "@/api/ImageService";

const imageService: ImageService = inject<ImageService>("image-service");

const props = defineProps({
  imageId: {type: Number, required: true},
  contentId: {type: Number, required: true},
  firstEpisodeId: {type: Number, default: -1},
  userInfo: {
    type: Object as PropType<V1GetFullContentUserInfo>,
    required: true,
  },
})

</script>

<style lang="scss" scoped>
.image-column {
  &__main {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__image {
    display: flex;
    height: 100%;
    width: 100%;
  }

  &__drop-button {
    display: flex;
    gap: 6px;
  }

  &__add-menu {
    height: fit-content;
    width: 100%;
    padding: 10px 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    & button {
      &:hover {
        background: #F4F5F7;
      }
    }
  }
}
</style>
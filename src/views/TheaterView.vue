<template>
  <div class="theater__main">
    <div>
      <TheaterAvatar
        v-if="isDataReady && details"
        :first-episode-id="getFirstEpisodeIdOrDefault(details?.Episodes, null)"
        :image-link="details.Image"
        :user-info="details.UserInfo"
      />
    </div>

    <div class="theater__body">
      <TheaterDetails v-if="isDataReady" :details="details" />
      <TheaterVideos v-if="isDataReady" :videos="details.Episodes" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router'
import TheaterDetails from "@/components/Theater/TheaterDetails.vue";
import {inject, onMounted, ref} from "vue";
import TheaterVideos from "@/components/Theater/TheaterVideos.vue";
import TheaterAvatar from "@/components/Theater/TheaterAvatar.vue";
import {V1GetFullContentEpisode, V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {ContentService} from "@/api/ContentService";

const route = useRoute();
const id = ref(+route.params.id);
const contentService: ContentService = inject("content-service");

const isDataReady = ref(false);
const details = ref<V1GetFullContentResponse>(null);
onMounted(async() => {
  details.value = await contentService.V1GetFullContentAsync(id.value, 1);

  isDataReady.value = true;
})

function getFirstEpisodeIdOrDefault(episodes: V1GetFullContentEpisode[], defaultValue: null) {
  return !episodes || episodes.length <= 0 ? defaultValue : episodes[0].Id;
}
</script>

<style scoped lang="scss">
.theater {
  &__main {
    display: grid;
    grid-template-columns: 255px 1fr;
    gap: 20px;
    margin: 20px 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
<template>
  <div class="theater__main">
    <div>
      <ImageColumn
        :image-link="content.image"
        :current-series="content.contentInfoToUser.continueToWatchFrom"
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
import ImageColumn from "@/components/Theater/TheaterAvatar.vue";
import {TheaterInfoToUser, FullContentDetails, VideoUnit} from "@/api/Models/FullContentDetails";
import {TheaterContentTypes} from "@/models/TheaterContentTypes";
import {TheaterContentStatus} from "@/models/TheaterContentStatus";
import {Tag} from "@/api/Models/Tag";
import {V1GetFullContentResponse} from "@/api/Responses/V1GetFullContentResponse";
import {ContentService} from "@/api/ContentService";

const contentService: ContentService = inject("content-service");
let isDataReady = ref(false);
const route = useRoute();
const id = ref(+route.params.id);
const content = GetContentAsync();

let details = ref<V1GetFullContentResponse>(null);
onMounted(async() => {
  details.value = await contentService.V1GetFullContentAsync(id.value, 1);

  isDataReady.value = true;
})

function GetContentAsync(): FullContentDetails {
  return new FullContentDetails(
    1,
    id.value + ' Название содержимогоа',
    'Все люди в жизни рано или поздно задаются различными вопросами касательно жизни и поставленных в ней целях. Дабы найти эти самые ответы, четверо молодых парней, Ли СынГи, Ли СанЮн, Юк СонЧже и Ян СэХён, вооружившись энергией любопытства, отправляются на поиски мастеров, которые помогут им в этом деле.',
    4.1,
    Date.now(),
    Date.now(),
    'images/image.png',
    TheaterContentTypes.Serial,
    TheaterContentStatus.Ongoing,
    'Юж. Корея',
    18,
    [],
    [
        new Tag(1, '1', '1'),
        new Tag(1, '1', '1'),
        new Tag(1, '1', '1')
    ],
    new TheaterInfoToUser(false, null, null, 4),
    [new VideoUnit(1, 'jopa', 1), new VideoUnit(1, 'jopa', 1), new VideoUnit(1, 'jopa', 1)],
  )
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
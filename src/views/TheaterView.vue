<template>
  <div class="theater__main">
    <div>
      <ImageColumn
        :image-link="content.image"
        :current-series="content.contentInfoToUser.continueToWatchFrom"
      />
    </div>

    <div class="theater__body">
      <TheaterDetails :details="content" />
      <TheaterVideos :videos="content.videos" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router'
import TheaterDetails from "@/components/Theater/TheaterDetails.vue";
import {ref} from "vue";
import TheaterVideos from "@/components/Theater/TheaterVideos.vue";
import ImageColumn from "@/components/Theater/TheaterAvatar.vue";
import {TheaterInfoToUser, TheaterContent, VideoUnit} from "@/components/Theater/ViewModels/TheaterContent";
import {TheaterContentTypes} from "@/models/TheaterContentTypes";
import {TheaterContentStatus} from "@/models/TheaterContentStatus";
import {Tag} from "@/components/Theater/ViewModels/Tag";

const route = useRoute()
const id = ref(+route.params.id);


const content = GetContentAsync();

function GetContentAsync(): TheaterContent {
  return new TheaterContent(
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
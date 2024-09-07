<template>
  <div class="search-content__container">
    <SearchItem
      v-for="item in itemsContent"
      :key="item"
      :item="item"
    />
  </div>
</template>

<script lang="ts" setup>
import SearchItem from './SearchItem.vue';
import {PropType} from "vue";
import {V1GetByQueryResponseContent} from "@/api/Requests/V1GetByQueryResponse";

const props = defineProps({
  itemsContent: {
    type: Object as PropType<V1GetByQueryResponseContent[]>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.search-content {
  &__container {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-columns: max-content;
    gap: 16px;
  }
}
</style>

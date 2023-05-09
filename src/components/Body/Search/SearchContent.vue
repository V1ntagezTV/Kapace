<template>
  <div class="search-content__container">
    <div 
      class="search-content__items-column"
    >
      <SearchItem
        v-for="item in firstColumnContent()"
        :key="item"
        :item="item"
      />
    </div>

    <div class="search-content__items-column">
      <SearchItem
        v-for="item in secondColumnContent()"
        :key="item"
        :item="item"
      />
    </div>
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

function firstColumnContent() {
  return props.itemsContent.filter((_, index) => index % 2 === 0);
}

function secondColumnContent() {
  return props.itemsContent.filter((_, index) => index % 2 === 1);
}
</script>

<style lang="scss" scoped>
    
.search-content {
  &__container {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0;
    gap: 20px;
  }

  &__items-column {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    gap: 20px;
  }
}

</style>

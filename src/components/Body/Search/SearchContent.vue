<template>
  <div class="search-content__container">
    <div 
      class="search-content__items-column"
    >
      <SearchItem
        v-for="item in firstColumnContent"
        :key="item"
        :item="item"
      />
    </div>

    <div class="search-content__items-column">
      <SearchItem
        v-for="item in secondColumnContent"
        :key="item"
        :item="item"
      />
    </div>
  </div>
</template>

<script>
import SearchItem from './SearchItem.vue';

export default {
  name: 'SearchContent',
  components: {
    SearchItem
  },
  props: {
    itemsContent: {
        type: Array,
        required: true
    },
  },
  computed: {
    firstColumnContent() {
        return this.itemsContent.filter((_, index) => index % 2 === 0 )
    },
    secondColumnContent() {
        return this.itemsContent.filter((_, index) => index % 2 === 1)
    }
  }
}
</script>

<style lang="scss">
    
.search-content {
    &__container {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 0px;
        gap: 20px;
    }

    &__items-column {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0px;
        gap: 20px;
    }
}

</style>

<template>
  <div class="search-filters__main">
    <BaseBackground>
      <FilterUnit
        v-for="filter in filters"
        :key="filter"
        ref="filterUnit"
        :clear-trigger="clearTrigger"
        :filter="filter"
        @update:filtersHasChanges="inputFilterSelected($event)"
      />
    </BaseBackground>

    <div class="search-filters__actions-container">
      <BaseButton
        :button-type="2"
        @click="AcceptFilters"
      >
        Принять
      </BaseButton>
      <BaseButton @click="CleanFiltersByParent">
        Сбросить
      </BaseButton>
    </div>
  </div>
</template>

<script>
import FilterUnit from "@/components/Search/Filter/FilterUnit.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";

export default {
  name: 'SearchFilters',
  components: {
    BaseBackground,
    BaseButton,
    FilterUnit,
  },
  emits: ["update:acceptedFilters", "clean:acceptedFilters"],
  data() {
    return {
      clearTrigger: false,
      emitAcceptedFilters: new Map(),
      filtersHasChanges: false,
      filters: {
        Type: {
          Name: "Тип",
          Type: "Flags",
          Values: {
            Фильм: false,
            Сериал: false,
            Шоу: false
          }
        },
        Status: {
          Name: "Статус",
          Type: "Flags",
          Values: {
            Завершен: false,
            Выходит: false,
            Скоро: false,
          }
        },
        Country: {
          Name: "Страна",
          Type: "Flags",
          Values: {
            Китай: false,
            Корея: false,
            Япония: false,
          }
        }
      },
    }
  },
  methods: {
    inputFilterSelected(keyValuePair) {
      this.emitAcceptedFilters.set(keyValuePair.key, keyValuePair.value)
    },

    CleanFiltersByParent() {
      this.clearTrigger = !this.clearTrigger;
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$emit('clean:acceptedFilters')
    },

    AcceptFilters() {
      let resultFilters = []

      this.emitAcceptedFilters.forEach((value, key) => {
        if (value) {
          resultFilters.push(key)
        }
      })

      this.$emit('update:acceptedFilters', resultFilters);
    }
  }
}

</script>


<style lang="scss" scoped>

.search-filters {
  &__main {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__actions-container{
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
}
</style>
<template>
  <div>
    <button
      class="filter-unit__header-button"
      @click="show = !show"
    >
      <p>{{ filter.Name }}</p>
      <DropArrow class="filter-unit__arrow-icon" />
    </button>

    <transition name="content">
      <div v-if="show">
        <div
          v-for="(value, key) in inputValues"
          :key="key"
          class="filter-unit__input-container"
          @click="inputClick(key, value)"
        >
          <input
            :checked="value"
            type="checkbox"
          >
          <label class="filter-unit__label">{{ key }}</label>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import DropArrow from "@/components/Icons/DropArrow.vue";
import { ref } from 'vue'

export default {
  name: "FilterUnit",
  components: {
    DropArrow,
  },
  props: {
    clearTrigger: Boolean,
    filter: {
      Name: String,
      Type: String,
      Values: {
        Type: Map
      }
    }
  },
  emits: ['clean:acceptedFilters'],
    data: function () {
    return {
      show: ref(true)
    }
  },
  computed: {
    inputValues() {
      return this.filter.Values;
    }
  },
  watch: {
    clearTrigger() {
      const mapValues = new Map(Object.entries(this.filter.Values));
      console.log(mapValues.size)
      for (let key of  mapValues.keys()) {
        // eslint-disable-next-line vue/no-mutating-props
        this.filter.Values[key] = false;
      }
    }
  },
  methods: {
    inputClick(key, value) {
      this.inputValues[key] = !value
      this.$emit('update:filtersHasChanges', {key: key, value: this.inputValues[key]});
    }
  },
}


</script>

<style lang="scss">

.filter-unit {

  &__header-button {
    display: flex;
    justify-content: space-between;
    width: 250px;
    height: 40px;
    align-items: center;
    padding: 0 20px;
    border-width: 0;
    background: transparent;

    border-top: 1px solid #eaeaea;

    & p {
      font-weight: 600;
      letter-spacing: 1px;
      font-size: 14px;
      line-height: 17px;
      color: #474A57;
      padding: 0;
    }

    &:hover {
      cursor: pointer;
      color: var(--secondary);
      background: #F4F5F7;
    }
  }

  &__arrow-icon {
    height: 20px;
    width: 20px;
  }

  &__input-container {
    display: flex;
    padding: 6px 20px;
    align-items: center;
    justify-content: flex-start;

    &:hover {
      cursor: pointer;
      background: #F4F5F7;
    }
  }

  &__label {
    margin-left: 4px;
    font-weight: 400;
    font-size: 14px;
    text-align: left;
    letter-spacing: 0.02em;
    cursor: pointer;
    -webkit-user-select: none;
  }
}

// --Animations-- //
.content {
  &-enter-from {
    opacity: 0;
  }

  &-enter-active {
    transition: opacity 0.5s ease;
  }

  &-enter-to {
    opacity: 100;
  }
}
</style>
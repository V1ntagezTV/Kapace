<template>
  <BaseBackground class="event-list__main">
    <div
      v-for="unit in props.sortProperties.GetSortedBy('Идентификатор')"
      :key="unit"
      class="event-list__unit"
    >
      <span class="event-list__value-main">
        <template v-for="property in unit.value" :key="property">
          <RouterLink
            v-if="property instanceof LinkedProperty" to="/"
            class="event-list__link event-list__text"
          >
            {{ property.value }}
          </RouterLink>
          <template v-else>{{ property.value }}
          </template>&nbsp;</template>
      </span>

      <div class="event-list__date">
        {{ unit.key }}
      </div>
    </div>
  </BaseBackground>
</template>

<script lang="ts" setup>
import BaseBackground from "@/components/Base/BaseBackground.vue";
import {GenericSortableDataClass} from "@/components/Profile/ViewModels/GenericSortableDataClass";
import {DataClass} from "@/components/Profile/ViewModels/DataClass";
import {LinkedProperty} from "@/components/Profile/ViewModels/LinkedProperty";
import {PropType} from "vue";

const props = defineProps({
  sortProperties: {
    type: Object as PropType<GenericSortableDataClass<DataClass>>,
    required: true
  }
})

</script>

<style lang="scss" scoped>

.event-list {
  &__main {
    display: flex;
    flex-direction: column;
    padding: 8px 20px;
  }

  &__unit {
    display: flex;
    height: 35px;
    justify-content: space-between;
    align-items: center;

    & span {
      height: fit-content;
    }
  }

  &__value-main {
    gap: 1em;
    text-align: start;
  }

  &__text {
    font-weight: 500;
    font-size: 14px;
  }

  &__link {
    text-decoration: underline;
    color: #577399;

    &:active {
      color: var(--secondary);
    }
  }

  &__date {
    color: #969BAB;
    font-weight: 500;
    font-size: 11px;
    line-height: 13px;
    text-align: justify;
    letter-spacing: 0.04em;
  }
}
</style>
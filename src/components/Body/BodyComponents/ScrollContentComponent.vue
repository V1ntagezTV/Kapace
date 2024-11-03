<template>
  <div
    v-show="props.contents.length > 0"
    class="scroll-content-component gap-8"
  >
    <h1 class="scroll-content-component__headline headline-small">
      {{ title }}
    </h1>

    <div class="scroll-content-component__box row gap-16">
      <template
        v-for="content in contents"
        :key="content"
      >
        <search-item :content="SearchContentFactory.mapToViewModel(content)" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, PropType} from 'vue';
import SearchItem from "@/components/Body/Search/SearchItem.vue";
import {SearchContentFactory} from "@/components/Body/Search/SearchItemViewFactory";
import {V1GetMainPageContentContent} from "@/api/Responses/V1GetMainPageContentResponse";

const props = defineProps({
  title: {type: String, required: true},
  contents: {type: Array as PropType<Array<V1GetMainPageContentContent>>, required: true}
})
</script>

<style lang="scss" scoped>
.scroll-content-component {
  &__headline {
    padding: 8px 0;
  }

  &__box {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-flow: row;
  }

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__title {
    display: flex;
    align-items: center;
    text-align: justify;

    color: #38383C;
  }

  &__icons {
    display: flex;
    flex-direction: row;
    gap: 10px;

    & svg {
      display: flex;
      justify-content: center;
      align-content: center;
      width: 30px;
      height: 30px;
      color: #969BAB;
    }

    & svg:hover {
      background-color: #EEEFF4;
      border-radius: 4px;
      cursor: pointer;
      color:#577399;
    }
  }

  &__scroll-body {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(290px, 1fr));
    gap: 25px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0;
    gap: 10px;

    width: 100%;
    height: 100%;

    &-title {
      display: flex;
      color: #474A57;
      align-items: flex-start;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 2;
      line-clamp: 2;

      transition: color 0.25s;

      &:hover {
        color: var(--secondary);
        cursor: pointer;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 15px 10px;
    position: absolute;
    width: 100%;
    height: fit-content;
    bottom: 0;

    background: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 6px 6px;
  }

  &__tag-title {
    height: fit-content;
    width: fit-content;
    font-style: normal;
    font-weight: 600;
    font-size: 11.5px;
    line-height: 15px;
    display: flex;
    align-items: center;
    text-align: justify;
    color: #FFFFFF;
  }

  &__tag {
    margin-left: 14px;
    margin-right: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 161px;
    height: 15px;
  }

  &__tag-counter {
    font-style: normal;
    font-weight: 900;
    font-size: 12px;
    line-height: 15px;
    letter-spacing: 0.04em;
  }

  &__tag-value-container {
    display: flex;
    flex-direction: row;
    gap: 6px;
    color: var(--outline-variant-light)
  }

  &__image-box {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    width: 100%;
    min-height: 300px;
    max-height: 350px;
    background: var(--font-gray-v1);
    border-radius: 16px;

    &:hover {
      cursor: pointer;
      width: 100%
    }
  }

  &__image {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: height 0.25s;
  }

  &__rating-value {
    position: absolute;
    width: 17px;
    height: 15px;
    left: 30px;
    top: 4px;

    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;

    display: flex;
    align-items: center;
    text-align: justify;
    margin: 0;

    color: #FFFFFF;
  }
}
</style>
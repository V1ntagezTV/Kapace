<template>
  <BaseBackground class="search-item__container">
    <div class="search-item__image-wrapper">
      <img class="search-item__image" src="@/assets/images/image.png">
    </div>

    <div class="search-item__details-container">
      <div class="search-item__details">
        <div class="search-item__title-container">
          <p class="search-item__title search-item__line-breaker">
            {{ item.ruTitle }}
          </p>
        </div>

        <a class="search-item__description search-item__line-breaker">
          {{ item.engTitle + " / " + item.year + " / " + item.country }}
        </a>

        <p class="search-item__genres search-item__line-breaker">
          {{ item.genres.join(", ") }}
        </p>

        <div class="search-item__language-container">
          <div
            v-for="lang in item.languages"
            :key="lang"
            class="search-item__language-unit"
          >
            <p class="search-item__language">
              {{ lang }}
            </p>
          </div>
        </div>
      </div>
      <div class="search-item__buttons">
        <div class="search-item__min-age-container">
          <span class="search-item__min-age">{{ item.minAge }}+</span>
        </div>
        <div class="search-item__min-age-container">
          <span class="search-item__min-age">11/12</span>
        </div>
        <button class="search-item__icon-button">
          <FavoriteIcon class="search-item__icon" />
        </button>
        <button class="search-item__icon-button">
          <DetailsIcon class="search-item__icon" />
        </button>
      </div>
    </div>
  </BaseBackground>
</template>

<script>
import FavoriteIcon from "@/components/Icons/FavoriteIcon.vue";
import BaseBackground from "@/components/Body/BaseBackground.vue";
import DetailsIcon from "@/components/Icons/DetailsIcon.vue";

export default {
    name: 'SearchItem',
    components: {
      DetailsIcon,
      BaseBackground,
      FavoriteIcon,
    },
    props: {
        item: {
          ruTitle: String,
          engTitle: String,
          year: Int8Array,
          country: String,
          minAge: Int8Array,
          genres: Array,
          languages: Array
        }
    }
}
</script>

<style lang="scss">

.search-item {

  &__image-wrapper {
    display: grid;
    height: 165px;
    width: 117px;
    background: #112D3D;
  }

  &__image {
    align-self: center;
    justify-self: center;
  }

  &__image-container {
    width: 100%;
    height: fit-content;
  }

  &__details-container {
    height: 100%;
    width: auto;

    gap: 6px;
    display: grid;
    grid-template-rows: 1fr;

    padding: 12px 12px;
  }

  &__container {
    display: grid;
    grid-auto-flow: column;
    height: 165px;
    overflow: hidden;
  }

  &__details {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 6px;

    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 1;
    grid-column-end: 2;

    p {
      padding: 0;
      margin: 0;
    }
  }

  &__title-container {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: flex-start;
    justify-items: left;
  }

  &__title {
    font-style: normal;
    font-weight: 900;
    font-size: 16px;
    color: #474A57;
    -webkit-line-clamp: 2;

    &:hover {
      cursor: pointer;
      text-decoration: underline;
      color: var(--secondary);
    }
  }

  &__line-breaker {
    letter-spacing: 0.02em;
    text-align: start;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  

  &__min-age-container {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;
    gap: 12px;
    border-radius: 4px;
    background: #474A57;
  }

  &__min-age {
    font-weight: 500;
    font-size: 12px;
    color: white;
  }

  &__description {
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    letter-spacing: 0.02em;
    color: #474A57;
  }

  &__genres {
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    -webkit-line-clamp: 1;
    color: #969BAB;
  }

  &__language {
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    letter-spacing: 0.02em;
    color: white;
  }

  &__language-container {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  &__language-unit {
    background: #577399;
    border-radius: 4px;
    padding: 4px 8px;
  }

  &__icon {
    height: 22px;
    width: 22px;
  }

  &__buttons {
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;

    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 3;
  }

  &__icon-button {
    display: grid;
    height: 32px;
    width: 32px;
    align-self: center;
    justify-self: center;
    text-decoration: none;
    border-color: transparent;
    background: transparent;
    color: #9D9D9D;
    border-width: 0;


    &:hover {
      cursor: pointer;
      background-color: #EEEFF4;
      border-radius: 4px;
      color: #577399;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 16%);
    }

    &:active {
      color: var(--secondary);
    }

    & svg {
      height: 18px;
      width: 18px;
      justify-self: center;
      align-self: center;
    }
  }
}

</style>




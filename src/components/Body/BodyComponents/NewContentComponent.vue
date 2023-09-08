<template>
  <base-background :type="2" class="new-content-component__container">
    <div class="new-content-component__images-wrapper">
      <div 
        v-for="image in images" 
        :key="image"
        ref="slides"
        class="new-content-component__images"
      >
        <img :src="image" alt="Изображение новости">
      </div>
    </div>

    <div class="new-content-component__details">
      <h2 class="new-content-component__details-title">
        {{ currentTitle }}
      </h2>
      <p class="new-content-component__details-description">
        {{ currentDescription }}
      </p>
    </div>

    <BaseBackground class="new-content-component__left-button" @click="leftSlide">
      <svg
        width="13" height="19"
        viewBox="0 0 13 19" xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor" d="M0.240792 9.30552L11.2625 0.403395C11.8467 -0.0684648 12.7004 0.45195 12.5486 1.18742L10.8333 9.50001L12.5486 17.8126C12.7004 18.5481 11.8467 19.0685 11.2625 18.5966L0.240791 9.69449C0.116904 9.59443 0.116905 9.40558 0.240792 9.30552Z"
          fill-opacity="0.5"
        />
      </svg>
    </BaseBackground>

    <div class="new-content-component__right-button" @click="rightSlide">
      <svg
        width="13" height="19"
        viewBox="0 0 13 19" xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor" d="M12.7592 9.69448L1.73754 18.5966C1.15333 19.0685 0.29961 18.548 0.451373 17.8126L2.16667 9.49999L0.451372 1.18742C0.299608 0.451946 1.15333 -0.0684662 1.73754 0.403393L12.7592 9.30551C12.8831 9.40557 12.8831 9.59442 12.7592 9.69448Z"
          fill-opacity="0.5"
        />
      </svg>
    </div>
  </base-background>
</template>

<script>

import BaseBackground from "@/components/Base/BaseBackground.vue";

export default {
    name: 'NewContentComponent',
    components: {BaseBackground},
    props: {
        slides: {
            type: Array,
            required: true,
        }
    },
    emits: [
      'select'
    ],
    data() {
        return {
            currentSlideNumber: 0
        }
    },
    computed: {
        images() {
            return this.slides.map(x => x.image);
        },
        currentTitle() {
            return this.slides[this.currentSlideNumber].title;
        },
        currentDescription() {
            return this.slides[this.currentSlideNumber].description;
        },

        offset() {
            return this.slideWidth * this.currentSlideNumber
        },

        slideWidth() {
            return this.firstSlide?.clientWidth;
        },

        firstSlide() {
            return this.$refs.slides?.[0]
        },

        slidesCount() {
            return this.images.length;
        },
    },
    watch: {
        currentSlideNumber() {
            if (!this.firstSlide) {
                return;
            }

            this.firstSlide.style.marginLeft = `-${this.offset}px`;
        }
    },
    methods: {
        selectSlide(imageIdx) {
            this.currentSlideNumber = Math.min(this.slidesCount - 1, Math.max(0, imageIdx))
            this.$emit('select', this.currentSlideNumber);
        },
        rightSlide() {
            this.selectSlide(this.currentSlideNumber + 1);
        },

        leftSlide() {
            this.selectSlide(this.currentSlideNumber - 1);
        },
    }
}

</script>

<style lang="scss">
.new-content-component {
    &__container {
        position: relative;
        width: 100%;
        height: 438px;
        overflow: hidden;

        &:hover {
            cursor: pointer;
        }
    }

    &__details {
        background: rgba(0, 0, 0, 0.3); 
        padding: 20px 0;
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-style: normal;
        letter-spacing: 0.04em;
        align-content: flex-start;
        text-align: left;
        max-height: 162px;
        width: 100%;
        color: #F4F5F7;
        left: 0;
        bottom: 0;

        &-title {
            width: fit-content;
            margin: 0 30px;
            font-weight: 900;
            font-size: 20px;
            line-height: 24px;
        }

        &-description {
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          text-align: justify;
          letter-spacing: 0.04em;
          margin: 0 30px;
        }
    }

    &__scroll-circles-bar {
        display: flex;
        flex-direction: row;
        gap: 10px;
        width: 100%;
        justify-content: center;
    }

    &__circle {
        border-radius: 50%;
        background: white;
        width: 9px;
        height: 9px;

        &--active, &:hover {
            background: #FF776F;
            cursor: pointer;
        }
    }

  &__left-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: absolute;
    width: 40px;
    height: 56px;
    left: 0;
    top: 191px;

    border-radius: 0 4px 4px 0;
    color: rgba(247, 247, 255, 0.5);
    background: rgba(0, 0, 0, 0.5);
    transition: color 0.1s, height 0.2s, width 0.2s;

    & path {
      transition: color 0.1s, height 0.2s, width 0.2s;
    }

    &:hover path {
      color: white;
      fill-opacity: 1;
    }

    &:hover svg {
      height: 26px;
      width: 16px;
    }

    &:hover {
      width: 46px;
      height: 62px;
      top: 188px;
    }
  }

    &__right-button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0;
      gap: 10px;

      position: absolute;
      width: 40px;
      height: 56px;
      right: 0;
      top: 191px;

      color: rgba(247, 247, 255, 0.5);
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px 0 0 4px;
      transition: color 0.1s, height 0.2s, width 0.2s;

      & path {
        transition: color 0.1s, height 0.2s, width 0.2s;
      }

      &:hover path {
          color: white;
          fill-opacity: 1;
      }

      &:hover svg {
          height: 26px;
          width: 16px;
      }

      &:hover {
          width: 46px;
          height: 62px;
          top: 188px;
      }
    }

    &__images-wrapper {
        display: flex;
        flex-direction: row;
        min-height: 438px;
        height: 100%;
        width: 100%;
    }

    &__images {
        display: flex;
        align-items: center;
        transition: all 0.5s ease-out;
        height: 100%;
        width: 100%;
    }
}
</style>
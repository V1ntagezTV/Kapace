<template>
  <div class="scroll-content-component">
    <div class="scroll-content-component__header">
      <h3 class="scroll-content-component__title">
        {{ scrollTitle }}
      </h3>
      <div class="scroll-content-component__icons">
        <svg
          width="24" height="24"
          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="currentColor" d="M8.17033 11.1808L15.4265 6.10142C16.0893 5.63748 17 6.11163 17 6.92066V17.0793C17 17.8884 16.0893 18.3625 15.4265 17.8986L8.17033 12.8192C7.60161 12.4211 7.60162 11.5789 8.17033 11.1808Z" />
        </svg>
        <svg
          width="24" height="24"
          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="currentColor" d="M15.8297 11.1808L8.57346 6.10142C7.91068 5.63748 7 6.11163 7 6.92066V17.0793C7 17.8884 7.91069 18.3625 8.57346 17.8986L15.8297 12.8192C16.3984 12.4211 16.3984 11.5789 15.8297 11.1808Z" />
        </svg>
      </div>
    </div>

    <div class="scroll-content-component__scroll-body">
      <div
        v-for="content in scrollContent"
        :key="content"
        class="scroll-content-component__card"
      >
        <div class="scroll-content-component__card-title">
          <router-link :to="{ name: 'theater', params: { id: content.id }}">
            {{ content.title }}
          </router-link>
        </div>
            
        <div class="scroll-content-component__card-content">
          <router-link class="scroll-content-component__image" :to="{ name: 'theater', params: { id: content.id }}">
            <img :src="content.image" alt="Dorama card image">
          </router-link>

          <div class="scroll-content-component__footer">
            <div class="scroll-content-component__tag">
              <p class="scroll-content-component__tag-title">
                Серий
              </p>
              <div class="scroll-content-component__tag-value-container">
                <Calendar />
                <p class="scroll-content-component__tag-counter">
                  {{ content.seriesCameOut }}/{{ content.seriesCount }}
                </p>
              </div>
            </div>

            <div class="scroll-content-component__tag">
              <p class="scroll-content-component__tag-title">
                Просмотров
              </p>
              <div class="scroll-content-component__tag-value-container">
                <EyeIcon />
                <p class="scroll-content-component__tag-counter">
                  {{ content.watched }}
                </p>
              </div>
            </div>
          </div>

          <div class="scroll-content-component__rating">
            <p class="scroll-content-component__rating-value">
              {{ content.rating }}
            </p>
            <StarIcon />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from '../../Icons/Calendar.vue';
import EyeIcon from '../../Icons/EyeIcon.vue';
import StarIcon from '../../Icons/StarIcon.vue';

export default {
  name: 'App',
  components: { Calendar, EyeIcon, StarIcon },
  props: {
    scrollTitle: {
      type: String,
      required: true
    },
    scrollContent: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      route: this.$route,
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-content-component {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 20px;
    gap: 10px;
    width: 100%;
    height: 100%;

    background: #FFFFFF;
    border-radius: 4px;

    & p {
        margin: 0;
    }

    &__title {
        width: 962px;
        height: 29px;
        margin: 0;
        font-style: normal;
        font-weight: 800;
        font-size: 24px;
        line-height: 29px;

        display: flex;
        align-items: center;
        text-align: justify;
    
        color: #38383C;
    }

    &__header {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
        width: auto;
        height: 45px;
    
        flex: none;
        order: 0;
        align-self: stretch;
        flex-grow: 0;
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
        font-style: normal;
        font-weight: 700;
        font-size: 16px;
        line-height: 19px;
        display: flex;
        align-items: flex-start;
        text-align: justify;
        color: #112D3D;

        & a {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;

          transition: color 0.25s;

          &:hover {
            color: var(--primary);
            cursor: pointer;
          }
        }
      }

      &-content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0;
        width: 100%;
        height: 267px;
        border-radius: 6px;

        & :hover {
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
        
        color: #FFFFFF;
    }

    &__tag-value-container {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    &__image {
      display: flex;
      justify-content: center;
      overflow: hidden;
      height: 100%;
      width: 100%;
      border-radius: 6px;

      & img {
        height: 100%;
        object-fit: cover;
        transition: height 0.25s;

        &:hover {
          height: 104%;
        }
      }
    }

    &__rating {
        position: absolute;
        left: 144px;
        top: 11px;
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
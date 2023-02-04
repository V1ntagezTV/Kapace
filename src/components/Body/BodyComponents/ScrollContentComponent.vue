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
          <p>{{ content.title }}</p>
        </div>
            
        <div class="scroll-content-component__card-content">
          <div class="scroll-content-component__image">
            <img :src="content.image">
          </div>

          <div class="scroll-content-component__footer">
            <div class="scroll-content-component__tag">
              <p class="scroll-content-component__tag-title">
                Серий
              </p>
              <div class="scroll-content-component__tag-value-container">
                <svg
                  width="15" height="15"
                  viewBox="0 0 15 15" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2.5" y="4.375"
                    width="10" height="8.125"
                    rx="0.625" stroke="white"
                    stroke-width="1.25"
                  />
                  <path d="M1.875 6.25C1.875 5.07149 1.875 4.48223 2.24112 4.11612C2.60723 3.75 3.19649 3.75 4.375 3.75H10.625C11.8035 3.75 12.3928 3.75 12.7589 4.11612C13.125 4.48223 13.125 5.07149 13.125 6.25H1.875Z" fill="white" />
                  <path
                    d="M5 2L5 4" stroke="white"
                    stroke-width="1.25" stroke-linecap="round"
                  />
                  <path
                    d="M10 2L10 3.875" stroke="white"
                    stroke-width="1.25" stroke-linecap="round"
                  />
                </svg>
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
                <svg
                  width="15" height="15"
                  viewBox="0 0 15 15" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd" clip-rule="evenodd"
                    d="M12.9814 7.5C12.9814 7.27575 12.8601 7.12847 12.6175 6.83393C11.7299 5.75634 9.77231 3.75 7.49998 3.75C5.22764 3.75 3.27001 5.75634 2.38246 6.83393C2.13986 7.12847 2.01855 7.27575 2.01855 7.5C2.01855 7.72425 2.13986 7.87153 2.38246 8.16607C3.27001 9.24366 5.22764 11.25 7.49998 11.25C9.77231 11.25 11.7299 9.24366 12.6175 8.16607C12.8601 7.87153 12.9814 7.72425 12.9814 7.5ZM7.49998 9.375C8.53551 9.375 9.37498 8.53553 9.37498 7.5C9.37498 6.46447 8.53551 5.625 7.49998 5.625C6.46444 5.625 5.62498 6.46447 5.62498 7.5C5.62498 8.53553 6.46444 9.375 7.49998 9.375Z" fill="white"
                  />
                </svg>
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
            <svg
              width="58" height="27"
              viewBox="0 0 58 27" fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_1055_470)">
                <path d="M56 20V3C56 1.34315 54.6569 0 53 0H13.2426C12.447 0 11.6839 0.316071 11.1213 0.87868L3.03109 8.96891C1.89536 10.1046 1.85562 11.9334 2.94095 13.1174L11.1082 22.0272C11.6765 22.6471 12.4788 23 13.3197 23H53C54.6569 23 56 21.6569 56 20Z" fill="#FF776F" />
                <path d="M16.6703 7.06565C17.1747 5.76072 17.4269 5.10826 17.8366 5.01783C17.9443 4.99406 18.0557 4.99406 18.1634 5.01783C18.5731 5.10826 18.8253 5.76072 19.3297 7.06565C19.6166 7.80773 19.76 8.17878 20.0283 8.43114C20.1036 8.50193 20.1853 8.56497 20.2723 8.61939C20.5825 8.81339 20.9697 8.84938 21.7441 8.92135C23.055 9.04319 23.7104 9.10411 23.9106 9.49195C23.952 9.57227 23.9802 9.65924 23.994 9.74924C24.0603 10.1838 23.5785 10.6387 22.6148 11.5486L22.3471 11.8013C21.8966 12.2267 21.6713 12.4394 21.541 12.7048C21.4628 12.864 21.4104 13.0355 21.3859 13.2124C21.3449 13.5073 21.4109 13.8158 21.5428 14.4329L21.59 14.6534C21.8266 15.7601 21.9449 16.3135 21.7972 16.5855C21.6646 16.8298 21.4202 16.9862 21.1503 16.9996C20.8498 17.0144 20.4264 16.6564 19.5796 15.9403C19.0217 15.4685 18.7427 15.2326 18.433 15.1405C18.1501 15.0563 17.8499 15.0563 17.567 15.1405C17.2573 15.2326 16.9783 15.4685 16.4204 15.9403C15.5736 16.6564 15.1502 17.0144 14.8497 16.9996C14.5798 16.9862 14.3354 16.8298 14.2028 16.5855C14.0551 16.3135 14.1734 15.7601 14.41 14.6534L14.4572 14.4329C14.5891 13.8158 14.6551 13.5073 14.6141 13.2124C14.5896 13.0355 14.5372 12.864 14.459 12.7048C14.3287 12.4394 14.1034 12.2267 13.6529 11.8013L13.3852 11.5486C12.4215 10.6387 11.9397 10.1838 12.006 9.74924C12.0198 9.65924 12.048 9.57227 12.0894 9.49195C12.2896 9.10411 12.945 9.04319 14.2559 8.92135C15.0303 8.84938 15.4175 8.81339 15.7277 8.61939C15.8147 8.56497 15.8964 8.50193 15.9717 8.43114C16.24 8.17878 16.3834 7.80773 16.6703 7.06565Z" fill="white" />
              </g>
              <defs>
                <filter
                  id="filter0_d_1055_470" x="-1"
                  y="0" width="59"
                  height="27" filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha" type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"
                  />
                  <feOffset dy="2" />
                  <feGaussianBlur stdDeviation="1" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                  <feBlend
                    mode="normal" in2="BackgroundImageFix"
                    result="effect1_dropShadow_1055_470"
                  />
                  <feBlend
                    mode="normal" in="SourceGraphic"
                    in2="effect1_dropShadow_1055_470" result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'App',
    components: { },
    props: {
        scrollTitle: {
            type: String,
            required: true
        },
        scrollContent: {
            type: Array,
            required: true,
        }
    }
}
</script>

<style lang="scss">

.scroll-content-component {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 0px;

    width: 100%;
    height: fit-content;

    background: #FFFFFF;
    border-radius: 4px;

    /* Inside auto layout */

    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;

    & p {
        margin: 0;
    }

    &__title {
        width: 962px;
        height: 29px;
        margin: 0 auto;
        font-style: normal;
        font-weight: 800;
        font-size: 24px;
        line-height: 29px;
        /* identical to box height */
    
        display: flex;
        align-items: center;
        text-align: justify;
    
        color: #38383C;
    }

    &__header {
        display: flex;
        flex-direction: row;
        margin: 0 25px;
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
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 10px 25px;
        gap: 25px;
        
        width: auto;
        height: fit-content;
        
        flex: none;
        order: 1;
        flex-grow: 0;
    }

    &__card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0;
        gap: 10px;

        width: 189px;
        height: 296px;

        &-title {
            font-style: normal;
            font-weight: 700;
            font-size: 16px;
            line-height: 19px;
            display: flex;
            align-items: flex-start;
            text-align: justify;

            & :hover {
                color: #FF776F;
                cursor: pointer;
            }
        }

        &-content {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
            background-color:gray;
            width: 189px;
            height: 267px;
            border-radius: 4px;
            
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
        gap: 9px;
        
        position: absolute;
        width: 189px;
        height: 65px;
        left: 0;
        top: 202px;
        
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0 0 4px 4px;
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
        border-radius: 4px;

        & img {
            max-height: 100%;
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
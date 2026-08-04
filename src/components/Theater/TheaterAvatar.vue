<template>
  <div class="theater-avatar">
    <div class="theater-avatar__image-box m-radius-16">
      <image-zoom
        class="theater-avatar__image"
        :src="props.imageLink"
        alt="Изображение"
        :thumbnail-fluid="true"
        :thumbnail-hover-scale="false"
        @error="$event.target.src = require('@/assets/images/DefaultImage.png')"
      />

      <div class="theater-avatar__overlay">
        <div class="theater-avatar__stats">
          <div class="theater-avatar__stat">
            <AddLibraryIcon class="theater-avatar__stat-icon" />
            <span class="label-medium">{{ props.series }}</span>
          </div>

          <div
            v-if="props.duration"
            class="theater-avatar__stat"
          >
            <TimerIcon class="theater-avatar__stat-icon" />
            <span class="label-medium">{{ props.duration }}</span>
          </div>

          <div class="theater-avatar__stat">
            <EyeIcon class="theater-avatar__stat-icon" />
            <span class="label-medium">{{ props.views }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ImageZoom from '@/components/UseReadyComponents/ImageZoom.vue';
import AddLibraryIcon from '@/components/Icons/AddLibraryIcon.vue';
import EyeIcon from '@/components/Icons/MaterialIcons/Eye.vue';
import TimerIcon from '@/components/Icons/TimerIcon.vue';

const props = defineProps({
  imageLink: { type: String, required: true },
  series: { type: String, required: true },
  views: { type: Number, required: true },
  duration: { type: String, default: null },
});
</script>

<style lang="scss" scoped>
.theater-avatar {
  width: 100%;
  min-width: 0;

  &__image-box {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    background-color: #f0f0f0;
  }

  &__image {
    width: 100%;
    display: block;
  }

  &__overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 16px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.55) 55%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex: 1 1 0;
    justify-content: center;
    color: #fff;
  }

  &__stat-icon {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    color: #fff;

    :deep(svg) {
      width: 20px;
      height: 20px;
      min-width: 20px;
      min-height: 20px;
    }
  }

  @media (max-width: 719px) {
    max-height: calc(100vh - 60px);
    max-height: calc(100dvh - 60px);

    &__image-box {
      max-height: inherit;
    }

    &__image {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      align-items: center;

      :deep(.thumbnail) {
        width: 100%;
        height: auto;
        max-width: 100%;
      }
    }
  }
}
</style>

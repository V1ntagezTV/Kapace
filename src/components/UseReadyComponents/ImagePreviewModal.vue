<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="image-preview-modal"
        tabindex="0"
        @click="close"
        @keydown.esc="close"
      >
        <button
          class="image-preview-modal__close"
          type="button"
          @click.stop="close"
        >
          &times;
        </button>

        <button
          v-if="images.length > 1"
          class="image-preview-modal__nav image-preview-modal__nav--prev"
          type="button"
          @click.stop="prev"
        >
          &#10094;
        </button>

        <div class="image-preview-modal__content" @click.stop>
          <img
            :src="currentImage.src"
            :alt="currentImage.alt"
            class="image-preview-modal__image"
          >
          <div
            v-if="images.length > 1"
            class="label-medium image-preview-modal__counter"
          >
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <button
          v-if="images.length > 1"
          class="image-preview-modal__nav image-preview-modal__nav--next"
          type="button"
          @click.stop="next"
        >
          &#10095;
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, watch } from 'vue';

export type PreviewImage = {
  src: string;
  alt: string;
};

const props = defineProps<{
  isOpen: boolean;
  images: PreviewImage[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  close: [];
  'update:currentIndex': [number];
}>();

const currentImage = computed(() => props.images[props.currentIndex] ?? { src: '', alt: '' });

function close() {
    emit('close');
}

function next() {
    if (props.images.length === 0) {
        return;
    }

    emit('update:currentIndex', (props.currentIndex + 1) % props.images.length);
}

function prev() {
    if (props.images.length === 0) {
        return;
    }

    emit('update:currentIndex', (props.currentIndex - 1 + props.images.length) % props.images.length);
}

function handleKeydown(event: KeyboardEvent) {
    if (!props.isOpen) {
        return;
    }

    if (event.key === 'Escape') {
        close();
    }
    if (event.key === 'ArrowRight') {
        next();
    }
    if (event.key === 'ArrowLeft') {
        prev();
    }
}

watch(() => props.isOpen, (open) => {
    if (open) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeydown);
        return;
    }

    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.image-preview-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.image-preview-modal__content {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview-modal__image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 16px;
}

.image-preview-modal__counter {
  margin-top: 10px;
  color: #fff;
}

.image-preview-modal__close {
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: #fff;
  font-size: 40px;
  cursor: pointer;
  z-index: 10002;
}

.image-preview-modal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #fff;
  font-size: 50px;
  padding: 20px;
  cursor: pointer;
  z-index: 10001;
}

.image-preview-modal__nav--prev {
  left: 10px;
}

.image-preview-modal__nav--next {
  right: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

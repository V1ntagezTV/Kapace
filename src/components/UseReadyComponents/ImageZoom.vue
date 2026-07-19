<template>
  <!-- Миниатюра (на которую кликаем) -->
  <div
    class="image-trigger"
    :class="{
      'image-trigger--fill': thumbnailFill,
      'image-trigger--fluid': thumbnailFluid,
      'image-trigger--no-hover-scale': !thumbnailHoverScale,
    }"
    :style="triggerStyle"
    @click="openModal"
  >
    <img
      :src="src"
      :alt="alt"
      class="thumbnail"
      :class="{
        'thumbnail--fill': thumbnailFill,
        'thumbnail--fluid': thumbnailFluid,
      }"
    >
  </div>

  <!-- Модальное окно (рендерится в body) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen" class="modal-overlay"
        tabindex="0" @click="closeModal"
        @keydown.esc="closeModal"
      >
        <!-- Кнопка закрытия -->
        <button class="close-btn" @click="closeModal">
          &times;
        </button>

        <!-- Большая картинка -->
        <div class="modal-content" @click.stop>
          <img
            :src="src" :alt="alt"
            class="full-image"
          >
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, onUnmounted, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image'
  },
  thumbnailBorderRadius: {
    type: String,
    default: '8px'
  },
  thumbnailFill: {
    type: Boolean,
    default: false
  },
  // Растянуть превью на 100% ширины контейнера, сохранив пропорции
  thumbnailFluid: {
    type: Boolean,
    default: false
  },
  thumbnailHoverScale: {
    type: Boolean,
    default: true
  }
});

const triggerStyle = computed(() => ({
  borderRadius: props.thumbnailBorderRadius,
  overflow: 'hidden'
}));


const isOpen = ref(false);

const openModal = () => {
  isOpen.value = true;
  // Блокируем скролл страницы при открытии
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  isOpen.value = false;
  // Возвращаем скролл
  document.body.style.overflow = '';
};

// Закрытие по нажатию ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeModal();
  }
};

// Добавляем слушатель событий на окно
watch(isOpen, (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});

// Очистка при удалении компонента
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Стили для миниатюры */
.image-trigger {
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 0;
  isolation: isolate;
}

.thumbnail {
  max-width: 100%;
  height: auto;
  display: block;
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.image-trigger:not(.image-trigger--no-hover-scale):hover .thumbnail {
  transform: scale(1.05);
}

.thumbnail--fill {
  width: 100%;
  max-width: none;
  aspect-ratio: 1;
  object-fit: cover;
}

.image-trigger--fill {
  width: 100%;
  display: block;
}

.image-trigger--fluid {
  width: 100%;
  display: block;
}

.thumbnail--fluid {
  width: 100%;
  max-width: 100%;
  height: auto;
}

/* Остальные стили без изменений... */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.full-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  z-index: 10000;
  line-height: 1;
}

.close-btn:hover {
  color: #ddd;
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
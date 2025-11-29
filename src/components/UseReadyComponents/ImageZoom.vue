<template>
  <!-- Миниатюра (на которую кликаем) -->
  <div class="image-trigger" @click="openModal">
    <img
      :src="src" :alt="alt"
      class="thumbnail"
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
import { ref, onUnmounted, watch } from 'vue';

// Принимаем пропсы
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image'
  }
});

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
  /* Используем inline-flex вместо inline-block */
  display: inline-flex;
  /* Центрируем содержимое по горизонтали и вертикали */
  justify-content: center;
  align-items: center;
  /* Убираем влияние строчных интервалов */
  line-height: 0;

  transition: transform 0.2s;
}

.image-trigger:hover {
  transform: scale(1.02);
}

.thumbnail {
  max-width: 100%;
  height: auto;
  /* display: block здесь уже есть, это хорошо, но flex у родителя приоритетнее */
  display: block;
  border-radius: 8px;
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
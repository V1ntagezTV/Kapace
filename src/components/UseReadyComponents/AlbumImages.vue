<template>
  <div class="gallery-wrapper">
    <!--
      Сетка. Вешаем ref="gridRef", чтобы JS мог считать количество колонок.
    -->
    <div ref="gridRef" class="gallery-grid">
      <div
        v-for="(img, index) in visibleImages"
        :key="index"
        class="image-trigger"
        @click="openModal(index)"
      >
        <img
          :src="img.src"
          :alt="img.alt || 'Gallery image'"
          class="thumbnail"
        >

        <!--
          Опционально: если мы скрыли какие-то картинки ради красоты сетки,
          показываем на последней доступной счетчик "+N".
          Это дает пользователю понять, что есть еще фото.
        -->
        <div
          v-if="index === visibleImages.length - 1 && hiddenCount > 0"
          class="more-overlay"
        >
          <span>+{{ hiddenCount }}</span>
        </div>
      </div>
    </div>

    <!-- Кнопка (опционально), если вы все же захотите сворачивать/разворачивать ряды -->
    <div v-if="enableExpand && hiddenCount > 0" class="expand-btn-wrapper">
      <button class="expand-btn" @click="toggleExpand">
        {{ isExpanded ? 'Свернуть' : 'Показать все' }}
      </button>
    </div>
  </div>

  <!-- Модальное окно (Teleport) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen" class="modal-overlay"
        tabindex="0" @click="closeModal"
        @keydown.esc="closeModal"
      >
        <button class="close-btn" @click.stop="closeModal">
          &times;
        </button>
        <button class="nav-btn prev-btn" @click.stop="prevImage">
          &#10094;
        </button>

        <div class="modal-content" @click.stop>
          <img
            :src="currentImage.src" :alt="currentImage.alt"
            class="full-image"
          >
          <div class="label-medium image-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <button class="nav-btn next-btn" @click.stop="nextImage">
          &#10095;
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  enableExpand: {
    type: Boolean,
    default: false
  },
  initialRows: {
    type: Number,
    default: 2
  }
});

// --- Логика Сетки ---
const gridRef = ref(null);
const columnsCount = ref(0);
const isExpanded = ref(false);
const resizeObserver = ref(null);

const updateColumnCount = () => {
  if (!gridRef.value) return;

  const style = window.getComputedStyle(gridRef.value);
  const gridTemplate = style.getPropertyValue('grid-template-columns');

  // Если грид еще не инициализировался или скрыт, gridTemplate может быть "none" или пустой
  if (!gridTemplate || gridTemplate === 'none') return;

  const count = gridTemplate.split(' ').length;

  if (count > 0 && count !== columnsCount.value) {
    columnsCount.value = count;
  }
};

const visibleImages = computed(() => {
  const total = props.images.length;
  const cols = columnsCount.value;

  // Если колонок 0 (еще не посчитали), показываем все или ничего (лучше все, чтобы грид отрисовался)
  if (cols === 0) return props.images;

  let limit;

  if (props.enableExpand && !isExpanded.value) {
    limit = cols * props.initialRows;
  } else {
    // Формула "ровной сетки": убираем остаток
    const remainder = total % cols;
    if (remainder === 0) {
      limit = total;
    } else {
      limit = total - remainder;
    }
  }

  if (limit > total) limit = total;
  // Если лимит 0 (например, узкий экран и мало фото), показываем хотя бы 1 ряд или сколько есть
  if (limit === 0 && total > 0) return props.images;

  return props.images.slice(0, limit);
});

const hiddenCount = computed(() => {
  return props.images.length - visibleImages.value.length;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// --- ИСПРАВЛЕННАЯ ЧАСТЬ С ResizeObserver ---
onMounted(() => {
  // Первичный расчет
  updateColumnCount();

  resizeObserver.value = new ResizeObserver((entries) => {
    // Оборачиваем в requestAnimationFrame, чтобы избежать ошибки
    // "ResizeObserver loop completed with undelivered notifications"
    window.requestAnimationFrame(() => {
      if (!Array.isArray(entries) || !entries.length) return;
      updateColumnCount();
    });
  });

  if (gridRef.value) {
    resizeObserver.value.observe(gridRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

// --- Логика Модалки (без изменений) ---
const isOpen = ref(false);
const currentIndex = ref(0);

const currentImage = computed(() => props.images[currentIndex.value] || {});

const openModal = (index) => {
  currentIndex.value = index;
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  isOpen.value = false;
  document.body.style.overflow = '';
};

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

const handleKeydown = (e) => {
  if (!isOpen.value) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
};

watch(isOpen, (newVal) => {
  if (newVal) window.addEventListener('keydown', handleKeydown);
  else window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.gallery-wrapper {
  width: 100%;
}

.gallery-grid {
  display: grid;
  /* Адаптивные колонки: заполняем столько, сколько влезет */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  width: 100%;
}

.image-trigger {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 4 / 3; /* Фиксированные пропорции */
  overflow: hidden;
  border-radius: 16px;
  background-color: #f0f0f0;
  transition: transform 0.2s;
}

.image-trigger:hover {
  transform: scale(1.02);
  z-index: 1; /* Чтобы при увеличении была поверх соседей */
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Оверлей "+3" */
.more-overlay {
  position: absolute;
  inset: 0; /* top/right/bottom/left: 0 */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 28px;
  font-weight: 700;
  backdrop-filter: blur(2px);
  border-radius: 16px;
}

/* Кнопка "Показать еще" */
.expand-btn-wrapper {
  margin-top: 20px;
  text-align: center;
}
.expand-btn {
  padding: 10px 24px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.expand-btn:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-content {
  position: relative;
  max-width: 90vw; max-height: 85vh;
  display: flex; flex-direction: column; align-items: center;
}
.full-image {
  max-width: 100%; max-height: 80vh;
  object-fit: contain; border-radius: 16px;
}
.image-counter {
  margin-top: 10px; color: #fff;
}
.close-btn {
  position: absolute; top: 20px; right: 30px;
  background: none; border: none; color: #fff;
  font-size: 40px; cursor: pointer; z-index: 10002;
}
.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #fff;
  font-size: 50px; padding: 20px; cursor: pointer; z-index: 10001;
}
.prev-btn { left: 10px; }
.next-btn { right: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
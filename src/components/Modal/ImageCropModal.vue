<template>
  <ModalWindow
    v-show="isVisible"
    class="image-crop-modal"
    @on:close="close"
  >
    <template #header>
      <div class="image-crop-modal__header row gap-16 v__center h__space-between">
        <div>
          <p class="title-large">
            Обрезка изображения
          </p>
          <p class="body-medium image-crop-modal__hint">
            Перемещайте рамку и изменяйте её размер за края
          </p>
        </div>
        <IconButton @click="close">
          <XIcon />
        </IconButton>
      </div>
    </template>

    <template #body>
      <div class="image-crop-modal__body">
        <div
          ref="cropStageRef"
          class="image-crop-modal__stage m-radius-8"
        >
          <div
            ref="imageAreaRef"
            class="image-crop-modal__image-area"
            :style="imageAreaStyle"
            @pointermove="updateInteraction"
            @pointerup="stopInteraction"
            @pointercancel="stopInteraction"
          >
            <img
              ref="imageRef"
              :src="imageUrl"
              :alt="'Изображение для обрезки'"
              class="image-crop-modal__image"
              draggable="false"
              @load="initializeCrop"
            >
            <div
              v-if="isImageReady"
              class="image-crop-modal__selection"
              :style="selectionStyle"
              @pointerdown="startMoving"
            >
              <div class="image-crop-modal__grid" />
              <button
                v-for="handle in resizeHandles"
                :key="handle"
                type="button"
                :class="[
                  'image-crop-modal__handle',
                  `image-crop-modal__handle--${handle}`,
                ]"
                :aria-label="`Изменить область обрезки: ${handle}`"
                @pointerdown.stop="startResizing($event, handle)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="image-crop-modal__actions row gap-8">
        <BaseButton
          variant="outline"
          class="m-radius-8"
          @click="close"
        >
          Отмена
        </BaseButton>
        <BaseButton
          variant="filled"
          class="m-radius-8"
          @click="applyCrop"
        >
          Применить
        </BaseButton>
      </div>
    </template>
  </ModalWindow>
</template>

<script setup lang="ts">
import BaseButton from '@/components/Base/BaseButton.vue';
import IconButton from '@/components/Base/Buttons/IconButton.vue';
import ModalWindow from '@/components/Base/ModalWindow.vue';
import XIcon from '@/components/Icons/xIcon.vue';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';

const MIN_SELECTION_SIZE = 40;
const MAX_OUTPUT_SIZE = 2000;

type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
type CropRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Interaction = {
  pointerId: number;
  type: 'move' | 'resize';
  handle?: ResizeHandle;
  startX: number;
  startY: number;
  rectangle: CropRectangle;
};

const props = defineProps<{
  isVisible: boolean;
  image: File | null;
  imageUrl: string;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'crop', image: File): void;
}>();

const cropStageRef = ref<HTMLElement | null>(null);
const imageAreaRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);
const displayScale = ref(1);
const displayedImageWidth = ref(0);
const displayedImageHeight = ref(0);
const isImageReady = ref(false);
const cropRectangle = ref<CropRectangle>({ x: 0, y: 0, width: 0, height: 0 });
const interaction = ref<Interaction | null>(null);
const resizeHandles: ResizeHandle[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

const imageAreaStyle = computed(() => ({
  width: `${displayedImageWidth.value}px`,
  height: `${displayedImageHeight.value}px`,
  visibility: isImageReady.value ? 'visible' : 'hidden',
}));

const selectionStyle = computed(() => ({
  left: `${cropRectangle.value.x}px`,
  top: `${cropRectangle.value.y}px`,
  width: `${cropRectangle.value.width}px`,
  height: `${cropRectangle.value.height}px`,
}));

watch(() => props.isVisible, async (isVisible) => {
  if (!isVisible) {
    document.body.style.overflow = '';
    return;
  }

  document.body.style.overflow = 'hidden';
  resetCrop();
  await nextTick();
  initializeCrop();
});

function resetCrop() {
  interaction.value = null;
  displayedImageWidth.value = 0;
  displayedImageHeight.value = 0;
  cropRectangle.value = { x: 0, y: 0, width: 0, height: 0 };
  isImageReady.value = false;
}

function initializeCrop() {
  const cropStage = cropStageRef.value;
  const image = imageRef.value;
  if (!props.isVisible || !cropStage || !image || !image.complete || image.naturalWidth === 0) {
    return;
  }

  const bounds = cropStage.getBoundingClientRect();
  displayScale.value = Math.min(
    bounds.width / image.naturalWidth,
    bounds.height / image.naturalHeight,
    1,
  );
  displayedImageWidth.value = image.naturalWidth * displayScale.value;
  displayedImageHeight.value = image.naturalHeight * displayScale.value;

  const initialWidth = Math.max(
    Math.min(displayedImageWidth.value * 0.7, displayedImageWidth.value),
    Math.min(MIN_SELECTION_SIZE, displayedImageWidth.value),
  );
  const initialHeight = Math.max(
    Math.min(displayedImageHeight.value * 0.7, displayedImageHeight.value),
    Math.min(MIN_SELECTION_SIZE, displayedImageHeight.value),
  );
  cropRectangle.value = {
    x: (displayedImageWidth.value - initialWidth) / 2,
    y: (displayedImageHeight.value - initialHeight) / 2,
    width: initialWidth,
    height: initialHeight,
  };
  isImageReady.value = true;
}

function startMoving(event: PointerEvent) {
  if (!isImageReady.value || event.button !== 0) {
    return;
  }

  beginInteraction(event, 'move');
}

function startResizing(event: PointerEvent, handle: ResizeHandle) {
  if (!isImageReady.value || event.button !== 0) {
    return;
  }

  beginInteraction(event, 'resize', handle);
}

function beginInteraction(event: PointerEvent, type: Interaction['type'], handle?: ResizeHandle) {
  interaction.value = {
    pointerId: event.pointerId,
    type,
    handle,
    startX: event.clientX,
    startY: event.clientY,
    rectangle: { ...cropRectangle.value },
  };
  imageAreaRef.value?.setPointerCapture(event.pointerId);
}

function updateInteraction(event: PointerEvent) {
  const currentInteraction = interaction.value;
  if (!currentInteraction || currentInteraction.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - currentInteraction.startX;
  const deltaY = event.clientY - currentInteraction.startY;
  if (currentInteraction.type === 'move') {
    moveSelection(currentInteraction.rectangle, deltaX, deltaY);
    return;
  }

  resizeSelection(currentInteraction.rectangle, currentInteraction.handle as ResizeHandle, deltaX, deltaY);
}

function moveSelection(rectangle: CropRectangle, deltaX: number, deltaY: number) {
  cropRectangle.value = {
    ...rectangle,
    x: clamp(rectangle.x + deltaX, 0, displayedImageWidth.value - rectangle.width),
    y: clamp(rectangle.y + deltaY, 0, displayedImageHeight.value - rectangle.height),
  };
}

function resizeSelection(
  rectangle: CropRectangle,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
) {
  let left = rectangle.x;
  let top = rectangle.y;
  let right = rectangle.x + rectangle.width;
  let bottom = rectangle.y + rectangle.height;
  const minimumWidth = Math.min(MIN_SELECTION_SIZE, displayedImageWidth.value);
  const minimumHeight = Math.min(MIN_SELECTION_SIZE, displayedImageHeight.value);

  if (handle.includes('w')) {
    left = clamp(rectangle.x + deltaX, 0, right - minimumWidth);
  }
  if (handle.includes('e')) {
    right = clamp(rectangle.x + rectangle.width + deltaX, left + minimumWidth, displayedImageWidth.value);
  }
  if (handle.includes('n')) {
    top = clamp(rectangle.y + deltaY, 0, bottom - minimumHeight);
  }
  if (handle.includes('s')) {
    bottom = clamp(rectangle.y + rectangle.height + deltaY, top + minimumHeight, displayedImageHeight.value);
  }

  cropRectangle.value = {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function stopInteraction(event: PointerEvent) {
  if (interaction.value?.pointerId !== event.pointerId) {
    return;
  }

  interaction.value = null;
  if (imageAreaRef.value?.hasPointerCapture(event.pointerId)) {
    imageAreaRef.value.releasePointerCapture(event.pointerId);
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function applyCrop() {
  const image = imageRef.value;
  if (!image || !props.image || !isImageReady.value) {
    return;
  }

  const sourceX = cropRectangle.value.x / displayScale.value;
  const sourceY = cropRectangle.value.y / displayScale.value;
  const sourceWidth = cropRectangle.value.width / displayScale.value;
  const sourceHeight = cropRectangle.value.height / displayScale.value;
  const outputScale = Math.min(1, MAX_OUTPUT_SIZE / Math.max(sourceWidth, sourceHeight));
  const outputWidth = Math.max(1, Math.round(sourceWidth * outputScale));
  const outputHeight = Math.max(1, Math.round(sourceHeight * outputScale));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const outputType = props.image.type === 'image/png' ? 'image/png' : 'image/jpeg';
  canvas.toBlob((blob) => {
    if (!blob || !props.image) {
      return;
    }

    emit('crop', new File([blob], props.image.name, {
      type: outputType,
      lastModified: Date.now(),
    }));
  }, outputType, 0.92);
}

function close() {
  emit('close');
}

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.image-crop-modal {
  z-index: 1000;

  :deep(.modal) {
    width: min(760px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    box-sizing: border-box;
  }

  &__header {
    width: 100%;
  }

  &__header p {
    margin: 0;
    text-align: left;
  }

  &__hint {
    margin-top: 4px !important;
    color: var(--outline-light);
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__stage {
    width: min(680px, calc(100vw - 80px));
    height: min(500px, calc(100vh - 240px));
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #1f1f1f;
  }

  &__image-area {
    position: relative;
    flex: none;
    touch-action: none;
    user-select: none;
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &__selection {
    position: absolute;
    box-sizing: border-box;
    border: 2px solid #fff;
    cursor: move;
    touch-action: none;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.58);
  }

  &__grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to right, transparent 33.1%, rgba(255, 255, 255, 0.65) 33.3%, transparent 33.5%, transparent 66.4%, rgba(255, 255, 255, 0.65) 66.6%, transparent 66.8%),
      linear-gradient(to bottom, transparent 33.1%, rgba(255, 255, 255, 0.65) 33.3%, transparent 33.5%, transparent 66.4%, rgba(255, 255, 255, 0.65) 66.6%, transparent 66.8%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.75);
  }

  &__handle {
    position: absolute;
    z-index: 2;
    width: 14px;
    height: 14px;
    padding: 0;
    border: 2px solid var(--primary40);
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);

    &--n {
      top: 0;
      left: 50%;
      cursor: ns-resize;
    }

    &--ne {
      top: 0;
      left: 100%;
      cursor: nesw-resize;
    }

    &--e {
      top: 50%;
      left: 100%;
      cursor: ew-resize;
    }

    &--se {
      top: 100%;
      left: 100%;
      cursor: nwse-resize;
    }

    &--s {
      top: 100%;
      left: 50%;
      cursor: ns-resize;
    }

    &--sw {
      top: 100%;
      left: 0;
      cursor: nesw-resize;
    }

    &--w {
      top: 50%;
      left: 0;
      cursor: ew-resize;
    }

    &--nw {
      top: 0;
      left: 0;
      cursor: nwse-resize;
    }
  }

  &__actions {
    justify-content: flex-end;
    width: 100%;
  }
}

@media (max-height: 720px) {
  .image-crop-modal__stage {
    height: min(380px, calc(100vh - 240px));
    min-height: 220px;
  }
}
</style>

<template>
  <modal-window
    v-show="refIsVisible"
    @on:close="onClose"
  >
    <template #header>
      <div class="column gap-16">
        <div class="row gap-16 v__start v__center h__space-between">
          <p class="h__fill title-large">
            Пожаловаться
          </p>
          <icon-button @click="onClose">
            <x-icon />
          </icon-button>
        </div>
        <p class="body-medium">
          Опишите проблему — мы рассмотрим жалобу
        </p>
      </div>
    </template>
    <template #body>
      <div class="column gap-16">
        <base-selector
          v-model="selectedReasonLabel"
          class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
          :title="'Выберите причину'"
          :selectable-values="reasonLabels"
          :mark-as-invalid-input="isReasonInvalid"
        />
        <base-text-area
          v-model="comment"
          class="m-radius-8 m3-bg-2 m-border m-border-hover m-border-active"
          :label="'Комментарий'"
          :placeholder="'Опишите проблему (до 500 символов)'"
          :mark-as-invalid-input="isCommentInvalid"
          :max-length="500"
        />
      </div>
    </template>
    <template #footer>
      <div class="column gap-8">
        <base-button
          :variant="'filled'"
          class="m-radius-8"
          @click="submitReport"
        >
          {{ isSubmitting ? 'Отправка…' : 'Отправить' }}
        </base-button>
      </div>
    </template>
  </modal-window>
</template>

<script setup lang="ts">
import ModalWindow from '@/components/Base/ModalWindow.vue';
import BaseButton from '@/components/Base/BaseButton.vue';
import BaseSelector from '@/components/Base/Selector/BaseSelector.vue';
import BaseTextArea from '@/components/Base/BaseTextArea.vue';
import IconButton from '@/components/Base/Buttons/IconButton.vue';
import XIcon from '@/components/Icons/xIcon.vue';
import { CreateReportRequest, ReportApi, ReportReason, ReportTargetType } from '@/api/ReportApi';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { StringExtensions } from '@/helpers/StringExtensions';
import { defineEmits, inject, onUnmounted, ref, watch } from 'vue';

const REPORT_REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: 'Спам', value: 'Spam' },
  { label: 'Оскорбления / токсичность', value: 'Abuse' },
  { label: 'Неверная информация', value: 'IncorrectInfo' },
  { label: 'Нарушение авторских прав', value: 'Copyright' },
  { label: 'Другое', value: 'Other' },
];

const reasonLabels = REPORT_REASON_OPTIONS.map(({ label }) => label);

const props = defineProps<{
  isVisible: boolean;
  targetType: ReportTargetType;
  targetId: string | number;
}>();

const emits = defineEmits<{
  (emitName: 'on:close'): void;
}>();

const eventStore = ClientEventStore();
const reportApi = inject<ReportApi>('report-api')!;

const refIsVisible = ref(props.isVisible);
const selectedReasonLabel = ref('');
const comment = ref('');
const isReasonInvalid = ref(false);
const isCommentInvalid = ref(false);
const isSubmitting = ref(false);

watch(() => props.isVisible, (newValue: boolean) => {
  refIsVisible.value = newValue;
  document.body.style.overflow = newValue ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

function resetForm() {
  selectedReasonLabel.value = '';
  comment.value = '';
  isReasonInvalid.value = false;
  isCommentInvalid.value = false;
  isSubmitting.value = false;
}

function onClose() {
  refIsVisible.value = false;
  document.body.style.overflow = '';
  resetForm();
  emits('on:close');
}

function resolveReasonValue(): ReportReason | null {
  const option = REPORT_REASON_OPTIONS.find(({ label }) => label === selectedReasonLabel.value);
  return option?.value ?? null;
}

function validateForm(): boolean {
  const reason = resolveReasonValue();
  isReasonInvalid.value = reason === null;
  isCommentInvalid.value =
    StringExtensions.isNullOrEmpty(comment.value) || comment.value.length > 500;

  return !isReasonInvalid.value && !isCommentInvalid.value;
}

async function submitReport() {
  if (isSubmitting.value) {
    return;
  }

  if (!validateForm()) {
    return;
  }

  const reason = resolveReasonValue();
  if (!reason) {
    return;
  }

  isSubmitting.value = true;

  const request: CreateReportRequest = {
    TargetType: props.targetType,
    TargetId: props.targetId,
    Reason: reason,
    Comment: comment.value.trim(),
  };

  const response = (await reportApi.create(request))
    .onException(() => eventStore.push('Что-то пошло не так! Ошибка сервера!', EventTypes.Error))
    .onBusinessError((errorDetails) => eventStore.push(errorDetails.Message, EventTypes.Error));

  isSubmitting.value = false;

  if (response.error) {
    return;
  }

  eventStore.push('Жалоба отправлена', EventTypes.Success);
  onClose();
}
</script>

<style scoped>
</style>

<template>
  <article
    class="comment-item"
    :class="{ 'comment-item--branching': showThreadStem }"
  >
    <div class="comment-item__layout">
      <div class="comment-item__rail">
        <img
          class="comment-item__avatar"
          :src="avatarSrc"
          :alt="authorLabel"
        >
        <div
          v-if="showThreadStem"
          class="comment-item__stem"
          aria-hidden="true"
        />
      </div>

      <div class="comment-item__main column gap-8">
        <div class="row gap-8 v__center comment-item__header">
          <p class="label-large comment-item__author">
            {{ authorLabel }}
          </p>
          <p class="label-small comment-item__meta">
            {{ formattedDate }}
          </p>
          <p
            v-if="isEdited"
            class="label-small comment-item__meta"
          >
            изменено
          </p>
        </div>

        <p
          v-if="isDeleted"
          class="label-small comment-item__deleted"
        >
          Комментарий удалён
        </p>
        <p
          v-else-if="!isEditing"
          class="body-medium comment-item__text"
        >
          {{ comment.Text }}
        </p>

        <comment-composer
          v-if="isEditing"
          :initial-text="comment.Text"
          label="Редактирование"
          submit-label="Сохранить"
          submitting-label="Сохранение…"
          show-cancel
          :is-submitting="isSaving"
          @submit="onSaveEdit"
          @cancel="isEditing = false"
        />

        <div
          v-if="!isDeleted && !isEditing"
          class="row gap-12 v__center comment-item__actions"
        >
          <button
            v-if="canReply"
            type="button"
            class="comment-item__action label-small"
            @click="showReplyForm = !showReplyForm"
          >
            Ответить
          </button>
          <button
            v-if="canManage"
            type="button"
            class="comment-item__action label-small"
            @click="startEdit"
          >
            Изменить
          </button>
          <button
            v-if="canManage"
            type="button"
            class="comment-item__action label-small comment-item__action--danger"
            :disabled="isDeleting"
            @click="onDelete"
          >
            {{ isDeleting ? 'Удаление…' : 'Удалить' }}
          </button>
        </div>

        <comment-composer
          v-if="showReplyForm"
          ref="replyComposer"
          label="Ответ"
          placeholder="Напишите ответ"
          submit-label="Ответить"
          show-cancel
          :is-submitting="isReplying"
          @submit="onReply"
          @cancel="showReplyForm = false"
        />
      </div>
    </div>

    <replies-list
      v-if="comment.Depth < COMMENT_MAX_DEPTH"
      class="comment-item__replies"
      :parent-id="comment.Id"
      :replies-count="comment.RepliesCount ?? 0"
      :authors="authors"
      :state="repliesState"
      :get-replies-state="getRepliesState"
      :create-reply="createReply"
      :update-comment="updateComment"
      :delete-comment="deleteComment"
      :expand-replies="expandReplies"
      :load-more-replies="loadMoreReplies"
      @expand="expandReplies(comment.Id)"
      @load-more="loadMoreReplies(comment.Id)"
    />
  </article>
</template>

<script setup lang="ts">
import CommentComposer from '@/components/Comments/CommentComposer.vue';
import {
  COMMENT_MAX_DEPTH,
  type CommentId,
  type V1CommentModel,
} from '@/api/CommentApi';
import type { CommentsAuthorMap } from '@/composables/comments/useComments';
import { resolveUserAvatarSrc } from '@/helpers/UserAvatarResolver';
import { userStore } from '@/store/UserStore';
import { computed, defineAsyncComponent, ref } from 'vue';

const RepliesList = defineAsyncComponent(() => import('@/components/Comments/RepliesList.vue'));

const props = defineProps<{
  comment: V1CommentModel;
  authors: CommentsAuthorMap;
  getRepliesState: (parentId: CommentId) => {
    items: V1CommentModel[];
    hasMore: boolean;
    isLoading: boolean;
    isExpanded: boolean;
  };
  createReply: (parentId: CommentId, text: string) => Promise<boolean>;
  updateComment: (commentId: CommentId, text: string) => Promise<boolean>;
  deleteComment: (commentId: CommentId) => Promise<boolean>;
  expandReplies: (parentId: CommentId) => Promise<void> | void;
  loadMoreReplies: (parentId: CommentId) => Promise<void> | void;
}>();

const user = userStore();
const isEditing = ref(false);
const showReplyForm = ref(false);
const isSaving = ref(false);
const isReplying = ref(false);
const isDeleting = ref(false);
const replyComposer = ref<{ reset: () => void } | null>(null);

const author = computed(() => props.authors[String(props.comment.AuthorId)]);
const authorLabel = computed(() => author.value?.Nickname || `Пользователь #${props.comment.AuthorId}`);
const avatarSrc = computed(() => resolveUserAvatarSrc(author.value?.ImageLink));
const isDeleted = computed(() => props.comment.Status === 'Deleted');
const isEdited = computed(() => props.comment.UpdatedAt != null);
const canManage = computed(() =>
  user.loggedIn &&
  String(user.userId) === String(props.comment.AuthorId) &&
  props.comment.Status === 'Published'
);
const canReply = computed(() =>
  user.loggedIn &&
  props.comment.Depth < COMMENT_MAX_DEPTH &&
  props.comment.Status !== 'Deleted'
);
const repliesState = computed(() => props.getRepliesState(props.comment.Id));
const repliesCount = computed(() => props.comment.RepliesCount ?? 0);

const showThreadStem = computed(() => {
  if (props.comment.Depth >= COMMENT_MAX_DEPTH) {
    return false;
  }
  const state = repliesState.value;
  if (!state.isExpanded) {
    return repliesCount.value > 0;
  }
  return state.items.length > 0 || state.isLoading;
});
const formattedDate = computed(() => formatCommentDate(props.comment.CreatedAt));

function formatCommentDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function startEdit() {
  showReplyForm.value = false;
  isEditing.value = true;
}

async function onSaveEdit(text: string) {
  if (isSaving.value) {
    return;
  }
  isSaving.value = true;
  const success = await props.updateComment(props.comment.Id, text);
  isSaving.value = false;
  if (success) {
    isEditing.value = false;
  }
}

async function onReply(text: string) {
  if (isReplying.value) {
    return;
  }
  isReplying.value = true;
  const success = await props.createReply(props.comment.Id, text);
  isReplying.value = false;
  if (success) {
    showReplyForm.value = false;
    replyComposer.value?.reset();
  }
}

async function onDelete() {
  if (isDeleting.value) {
    return;
  }
  isDeleting.value = true;
  await props.deleteComment(props.comment.Id);
  isDeleting.value = false;
}
</script>

<style scoped lang="scss">
$avatar-size: 40px;
$rail-gap: 12px;
$thread-color: #C5CAD3;
$thread-width: 2px;

.comment-item {
  --comment-avatar-size: #{$avatar-size};
  --comment-rail-gap: #{$rail-gap};
  --comment-thread-color: #{$thread-color};
  --comment-thread-width: #{$thread-width};

  &__layout {
    display: flex;
    align-items: stretch;
    gap: $rail-gap;
  }

  &__rail {
    display: flex;
    width: $avatar-size;
    flex-shrink: 0;
    flex-direction: column;
    align-items: flex-start;
  }

  &__avatar {
    width: $avatar-size;
    height: $avatar-size;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: #EEEFF4;
  }

  &__stem {
    width: $thread-width;
    flex: 1 1 auto;
    min-height: 8px;
    margin-top: 4px;
    margin-left: calc((#{$avatar-size} - #{$thread-width}) / 2);
    background: $thread-color;
  }

  &__main {
    min-width: 0;
    flex: 1;
    padding-top: 2px;
    padding-bottom: 10px;
  }

  &__author {
    margin: 0;
    color: var(--on-surface);
  }

  &__meta {
    margin: 0;
    color: #969BAB;
  }

  &__text {
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    text-align: left;
  }

  &__deleted {
    margin: 0;
    color: #969BAB;
    font-style: italic;
    text-align: left;
  }

  &__action {
    padding: 0;
    border: none;
    background: none;
    color: var(--primary40);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
      text-decoration: none;
    }
  }

  &__header {
    flex-wrap: wrap;
  }

  &__replies {
    margin-top: 4px;
  }
}
</style>

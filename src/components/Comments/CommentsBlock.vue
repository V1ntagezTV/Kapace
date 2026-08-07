<template>
  <section class="comments-block column gap-16">
    <div class="row gap-8 v__center h__space-between">
      <h2 class="title-large comments-block__title">
        Комментарии
      </h2>
    </div>

    <comment-composer
      v-if="user.loggedIn"
      ref="rootComposer"
      :is-submitting="isCreatingRoot"
      @submit="onCreateRoot"
    />
    <div
      v-else
      class="comments-block__guest row gap-12 v__center h__space-between"
    >
      <p class="body-medium comments-block__guest-text">
        Войдите, чтобы оставить комментарий
      </p>
      <base-button
        variant="filled"
        class="m-radius-8 fit-content"
        @click="goToLogin"
      >
        Войти
      </base-button>
    </div>

    <p
      v-if="isLoadingRoots && !isInitialized"
      class="body-medium comments-block__muted"
    >
      Загрузка комментариев…
    </p>

    <div
      v-show="!isLoadingRoots && isInitialized"
      class="column gap-8"
    >
      <comment-item
        v-for="comment in roots"
        :key="String(comment.Id)"
        :comment="comment"
        :authors="authors"
        :get-replies-state="getRepliesState"
        :create-reply="onCreateReply"
        :update-comment="onUpdateComment"
        :delete-comment="onDeleteComment"
        :expand-replies="onExpandReplies"
        :load-more-replies="onLoadMoreReplies"
      />
    </div>

    <base-button
      v-if="hasMoreRoots"
      variant="outline"
      class="m-radius-8 comments-block__more"
      :disabled="isLoadingRoots"
      @click="onLoadMoreRoots"
    >
      {{ isLoadingRoots ? 'Загрузка…' : 'Ещё' }}
    </base-button>
  </section>
</template>

<script setup lang="ts">
import BaseButton from '@/components/Base/BaseButton.vue';
import CommentComposer from '@/components/Comments/CommentComposer.vue';
import CommentItem from '@/components/Comments/CommentItem.vue';
import {
  type CommentableTargetType,
  type CommentId,
} from '@/api/CommentApi';
import { useComments } from '@/composables/comments/useComments';
import { userStore } from '@/store/UserStore';
import { computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  targetType: CommentableTargetType;
  targetId: CommentId;
}>();

const user = userStore();
const router = useRouter();
const targetTypeRef = toRef(props, 'targetType');
const targetIdRef = toRef(props, 'targetId');

const comments = useComments(targetTypeRef, targetIdRef);

const roots = computed(() => comments.roots.value);
const authors = computed(() => comments.authors.value);
const hasMoreRoots = computed(() => comments.hasMoreRoots.value);
const isLoadingRoots = computed(() => comments.isLoadingRoots.value);
const isInitialized = computed(() => comments.isInitialized.value);
const getRepliesState = comments.getRepliesState;
const loadMoreRoots = comments.loadMoreRoots;
const expandReplies = comments.expandReplies;
const loadMoreReplies = comments.loadMoreReplies;
const createComment = comments.createComment;
const updateComment = comments.updateComment;
const deleteComment = comments.deleteComment;

const rootComposer = ref<{ reset: () => void } | null>(null);
const isCreatingRoot = ref(false);

async function onCreateRoot(text: string) {
  if (isCreatingRoot.value) {
    return;
  }
  isCreatingRoot.value = true;
  const success = await createComment(text, null);
  isCreatingRoot.value = false;
  if (success) {
    rootComposer.value?.reset();
  }
}

async function onCreateReply(parentId: CommentId, text: string) {
  return await createComment(text, parentId);
}

async function onUpdateComment(commentId: CommentId, text: string) {
  return await updateComment(commentId, text);
}

async function onDeleteComment(commentId: CommentId) {
  return await deleteComment(commentId);
}

async function onExpandReplies(parentId: CommentId) {
  await expandReplies(parentId);
}

async function onLoadMoreReplies(parentId: CommentId) {
  await loadMoreReplies(parentId);
}

async function onLoadMoreRoots() {
  await loadMoreRoots();
}

function goToLogin() {
  router.push('/login');
}
</script>

<style scoped lang="scss">
.comments-block {
  padding: 20px;
  border-radius: 16px;
  background: white;

  &__title {
    margin: 0;
  }

  &__guest {
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--primary95);
  }

  &__guest-text {
    margin: 0;
  }

  &__muted {
    margin: 0;
    color: #969BAB;
  }

  &__more {
    align-self: flex-start;
  }
}
</style>

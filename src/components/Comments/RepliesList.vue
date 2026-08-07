<template>
  <div
    class="replies-list column"
    :class="{
      'replies-list--expanded': state.isExpanded,
      'replies-list--collapsed': !state.isExpanded && repliesCount > 0,
    }"
  >
    <div
      v-if="!state.isExpanded && repliesCount > 0"
      class="replies-list__summary"
    >
      <svg
        class="replies-list__elbow"
        :width="elbowWidth"
        :height="summaryElbowHeight"
        :viewBox="`0 0 ${elbowWidth} ${summaryElbowHeight}`"
        fill="none"
        aria-hidden="true"
      >
        <path
          :d="summaryElbowPath"
          :stroke="threadColor"
          :stroke-width="threadWidth"
          stroke-linecap="butt"
          stroke-linejoin="round"
        />
      </svg>
      <button
        type="button"
        class="replies-list__action body-medium"
        @click="$emit('expand')"
      >
        {{ repliesCountLabel }}
      </button>
    </div>

    <template v-else-if="state.isExpanded">
      <div
        v-for="(reply, index) in state.items"
        :key="String(reply.Id)"
        class="replies-list__branch"
        :class="{ 'replies-list__branch--last': isLastBranch(index) }"
      >
        <svg
          class="replies-list__elbow"
          :width="elbowWidth"
          :height="elbowHeight"
          :viewBox="`0 0 ${elbowWidth} ${elbowHeight}`"
          fill="none"
          aria-hidden="true"
        >
          <path
            :d="buildElbowPath(isLastBranch(index))"
            :stroke="threadColor"
            :stroke-width="threadWidth"
            stroke-linecap="butt"
            stroke-linejoin="round"
          />
        </svg>
        <comment-item
          :comment="reply"
          :authors="authors"
          :get-replies-state="getRepliesState"
          :create-reply="createReply"
          :update-comment="updateComment"
          :delete-comment="deleteComment"
          :expand-replies="expandReplies"
          :load-more-replies="loadMoreReplies"
        />
      </div>

      <p
        v-if="state.isLoading"
        class="body-medium replies-list__muted"
      >
        Загрузка ответов…
      </p>

      <button
        v-if="state.hasMore && !state.isLoading"
        type="button"
        class="replies-list__action body-medium replies-list__action--more"
        @click="$emit('load-more')"
      >
        Ещё ответы
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import CommentItem from '@/components/Comments/CommentItem.vue';
import type { CommentId, V1CommentModel } from '@/api/CommentApi';
import type { CommentsAuthorMap } from '@/composables/comments/useComments';
import { formatRepliesCountLabel } from '@/helpers/repliesCountLabel';
import { computed } from 'vue';

const AVATAR_SIZE = 40;
const RAIL_GAP = 12;
const THREAD_WIDTH = 2;
const ELBOW_RADIUS = 12;
const THREAD_COLOR = '#C5CAD3';
/** Half of body-medium line (~24px) so the L aims at the label center. */
const SUMMARY_ELBOW_HEIGHT = 12;

/** Left edge of the 2px stem under a centered 40px avatar. */
const THREAD_LEFT = (AVATAR_SIZE - THREAD_WIDTH) / 2;
const CHILD_AVATAR_LEFT = AVATAR_SIZE + RAIL_GAP;
const ELBOW_WIDTH = CHILD_AVATAR_LEFT - THREAD_LEFT;
const ELBOW_HEIGHT = AVATAR_SIZE / 2;
const STROKE_X = THREAD_WIDTH / 2;

const props = defineProps<{
  parentId: CommentId;
  repliesCount: number;
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
  state: {
    items: V1CommentModel[];
    hasMore: boolean;
    isLoading: boolean;
    isExpanded: boolean;
  };
}>();

defineEmits<{
  (e: 'expand'): void;
  (e: 'load-more'): void;
}>();

const threadColor = THREAD_COLOR;
const threadWidth = THREAD_WIDTH;
const elbowWidth = ELBOW_WIDTH;
const elbowHeight = ELBOW_HEIGHT;
const summaryElbowHeight = SUMMARY_ELBOW_HEIGHT;

const repliesCountLabel = computed(() => formatRepliesCountLabel(props.repliesCount));

const summaryElbowPath = computed(() => buildLPath(SUMMARY_ELBOW_HEIGHT));

const hasTrailingControls = computed(
  () => props.state.isLoading || (props.state.hasMore && !props.state.isLoading)
);

function isLastBranch(index: number): boolean {
  return index === props.state.items.length - 1 && !hasTrailingControls.value;
}

function buildLPath(height: number): string {
  const radius = Math.min(ELBOW_RADIUS, height - STROKE_X);
  const arcStartY = Math.max(STROKE_X, height - radius);
  const arcEndX = STROKE_X + radius;
  const endX = ELBOW_WIDTH - STROKE_X;
  return [
    `M ${STROKE_X} 0`,
    `L ${STROKE_X} ${arcStartY}`,
    `A ${radius} ${radius} 0 0 0 ${arcEndX} ${height}`,
    `L ${endX} ${height}`,
  ].join(' ');
}

function buildElbowPath(isLast: boolean): string {
  const arcStartY = Math.max(STROKE_X, ELBOW_HEIGHT - ELBOW_RADIUS);
  const arcEndX = STROKE_X + ELBOW_RADIUS;
  const endX = ELBOW_WIDTH - STROKE_X;

  if (isLast) {
    return buildLPath(ELBOW_HEIGHT);
  }

  // T: вертикаль сквозь узел + скруглённый поворот направо к аватарке.
  return [
    `M ${STROKE_X} 0`,
    `L ${STROKE_X} ${ELBOW_HEIGHT}`,
    `M ${STROKE_X} ${arcStartY}`,
    `A ${ELBOW_RADIUS} ${ELBOW_RADIUS} 0 0 0 ${arcEndX} ${ELBOW_HEIGHT}`,
    `L ${endX} ${ELBOW_HEIGHT}`,
  ].join(' ');
}
</script>

<style scoped lang="scss">
$avatar-size: 40px;
$rail-gap: 12px;
$thread-width: 2px;
$thread-color: #C5CAD3;
$thread-left: calc((#{$avatar-size} - #{$thread-width}) / 2);
$child-avatar-left: calc(#{$avatar-size} + #{$rail-gap});
$content-inset: $child-avatar-left;
$summary-line-height: 24px;

.replies-list {
  position: relative;
  margin: 0;
  padding: 0;
  border: none;

  &__summary {
    position: relative;
    display: flex;
    align-items: center;
    min-height: $summary-line-height;
    padding-left: $content-inset;

    // Bridge from parent stem into the summary elbow.
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: $thread-left;
      width: $thread-width;
      height: 4px;
      background: $thread-color;
    }
  }

  &__branch {
    position: relative;
    padding-left: $content-inset;

    & + & {
      margin-top: 12px;
    }

    // Straight continuation under the elbow; same x as parent stem / SVG stroke.
    &::before {
      content: '';
      position: absolute;
      top: calc(#{$avatar-size} / 2);
      bottom: -12px;
      left: $thread-left;
      width: $thread-width;
      background: $thread-color;
    }

    &--last::before {
      display: none;
    }

    // Bridge from parent stem into the first SVG elbow.
    &:first-child::after {
      content: '';
      position: absolute;
      top: -4px;
      left: $thread-left;
      width: $thread-width;
      height: 4px;
      background: $thread-color;
    }
  }

  &__elbow {
    position: absolute;
    top: 0;
    left: $thread-left;
    display: block;
    overflow: visible;
    pointer-events: none;
  }

  &__action {
    position: relative;
    z-index: 1;
    align-self: flex-start;
    padding: 0 0 0 8px;
    border: none;
    background: none;
    color: var(--primary40);
    line-height: $summary-line-height;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    &--more {
      margin-left: $content-inset;
    }
  }

  &--expanded &__muted {
    margin-left: $content-inset;
  }

  &__muted {
    margin: 0;
    color: #969BAB;
  }
}
</style>

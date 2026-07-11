<template>
  <div class="field-diff">
    <div class="field-diff__name body-large">
      {{ name }}
    </div>

    <avatar-diff-block
      v-if="fieldKind === 'avatar'"
      :name="name"
      :old-value="oldValue"
      :new-value="newValue"
    />

    <image-list-diff-block
      v-else-if="fieldKind === 'list'"
      :name="name"
      :old-value="oldValue"
      :new-value="newValue"
    />

    <div v-else class="field-diff__lines">
      <div
        v-for="(line, index) in diffLines"
        :key="index"
        class="field-diff__line"
        :class="`field-diff__line--${line.type}`"
      >
        <span class="field-diff__prefix">{{ prefixFor(line.type) }}</span>
        <span class="field-diff__text">{{ line.text || ' ' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import AvatarDiffBlock from '@/components/ContentHistory/AvatarDiffBlock.vue';
import ImageListDiffBlock from '@/components/ContentHistory/ImageListDiffBlock.vue';
import { detectImageFieldKind } from '@/helpers/imageDiff';
import { computeLineDiff, type DiffLineType } from '@/helpers/textLineDiff';

const props = defineProps<{
  name: string;
  oldValue: string | null | undefined;
  newValue: string | null | undefined;
}>();

const fieldKind = computed(() => detectImageFieldKind(props.name, props.oldValue, props.newValue));
const diffLines = computed(() => computeLineDiff(props.oldValue, props.newValue));

function prefixFor(type: DiffLineType): string {
    if (type === 'removed') {
        return '-';
    }
    if (type === 'added') {
        return '+';
    }
    return ' ';
}
</script>

<style lang="scss" scoped>
.field-diff {
  width: 100%;

  &__name {
    color: #38383C;
    margin-bottom: 4px;
  }

  &__lines {
    overflow: hidden;
    width: 100%;
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.35;
    text-align: left;
  }

  &__line {
    display: flex;
    gap: 6px;
    padding: 1px 22px;
    white-space: pre-wrap;
    word-break: break-word;

    &--removed {
      background: #ffeef0;
      color: #c62828;
    }

    &--added {
      background: #e6ffed;
      color: #2e7d32;
    }

    &--unchanged {
      background: #fafafa;
      color: #49454F;
    }
  }

  &__prefix {
    flex-shrink: 0;
    width: 12px;
    user-select: none;
  }

  &__text {
    flex: 1;
    min-width: 0;
  }
}
</style>

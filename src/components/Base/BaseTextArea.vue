<template>
  <div class="textarea__box">
    <label v-if="label" class="textarea__label">{{ label }}</label>
    <textarea class="textarea__text-area" placeholder="Описание" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  label: {type: String, required: false, default: null},
})
</script>

<style lang="scss" scoped>
.textarea {
  &__box {
    display: flex;
    position: relative;
    height: 100%;
  }

  &__text-area {
    display: flex;
    height: 100%;
    width: 100%;
    resize: vertical;
    padding: 10px 16px 10px 16px;

    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    border: none;
    outline: 1px solid var(--font-gray-v1);
    border-radius: 6px;
    transition: outline-width 0.3s, outline-color 0.3s;

    &:hover {
      outline: 1px solid var(--primary);
    }

    &:focus-within {
      outline: 1px solid var(--primary);
    }
  }

  &__label {
    background: white;
    position: absolute;
    left: 12px;
    top: -9px;
    width: fit-content;

    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    padding-left: 4px;
    padding-right: 4px;
  }
}

</style>
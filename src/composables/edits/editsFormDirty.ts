import { computed, ref } from 'vue';

export const contentEditorDirty = ref(false);
export const episodeEditorDirty = ref(false);
export const personEditorDirty = ref(false);

export const editsFormDirty = computed(
    () => contentEditorDirty.value || episodeEditorDirty.value || personEditorDirty.value
);

export function clearAllEditsFormDirty() {
    contentEditorDirty.value = false;
    episodeEditorDirty.value = false;
    personEditorDirty.value = false;
}

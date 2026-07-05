import { ref, watch, type Ref } from 'vue';

type WatchSource = Ref<unknown> | (() => unknown);

export function useFormDirtyState(sources: WatchSource[]) {
    const isDirty = ref(false);
    const trackingEnabled = ref(false);

    watch(
        sources,
        () => {
            if (trackingEnabled.value) {
                isDirty.value = true;
            }
        },
        { deep: true }
    );

    function pauseTracking() {
        trackingEnabled.value = false;
    }

    function resumeTracking() {
        isDirty.value = false;
        trackingEnabled.value = true;
    }

    function clearDirty() {
        isDirty.value = false;
    }

    return {
        isDirty,
        pauseTracking,
        resumeTracking,
        clearDirty,
    };
}

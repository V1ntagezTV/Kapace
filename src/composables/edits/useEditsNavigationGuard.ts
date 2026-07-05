import { contentEditorDirty, clearAllEditsFormDirty, editsFormDirty } from '@/composables/edits/editsFormDirty';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

const UNSAVED_CHANGES_MESSAGE = 'Есть несохранённые изменения. Уйти без сохранения?';

const EDITOR_ROUTE_NAMES = new Set([
    'create-content',
    'edit-content',
    'create-episode',
    'edit-episode',
    'edit-episode-prefill',
]);

function isEditorRoute(routeName: string | symbol | null | undefined): boolean {
    return typeof routeName === 'string' && EDITOR_ROUTE_NAMES.has(routeName);
}

function shouldConfirmNavigation(
    fromName: string | symbol | null | undefined,
    toName: string | symbol | null | undefined
): boolean {
    if (!editsFormDirty.value) {
        return false;
    }

    const fromEditor = isEditorRoute(fromName);
    const toEditor = isEditorRoute(toName);

    if (fromEditor && !toEditor) {
        return true;
    }

    return fromEditor && toEditor && fromName !== toName;
}

function confirmLeave(): boolean {
    return window.confirm(UNSAVED_CHANGES_MESSAGE);
}

export function useEditsNavigationGuard() {
    onBeforeRouteLeave((to, from, next) => {
        if (!shouldConfirmNavigation(from.name, to.name)) {
            next();
            return;
        }

        if (confirmLeave()) {
            clearAllEditsFormDirty();
            next();
            return;
        }

        next(false);
    });

    onBeforeRouteUpdate((to, from, next) => {
        if (!shouldConfirmNavigation(from.name, to.name)) {
            next();
            return;
        }

        if (confirmLeave()) {
            clearAllEditsFormDirty();
            next();
            return;
        }

        next(false);
    });
}

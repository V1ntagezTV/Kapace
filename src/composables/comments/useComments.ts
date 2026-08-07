import {
    CommentableTargetType,
    CommentApi,
    CommentId,
    COMMENT_PAGE_LIMIT,
    COMMENT_TEXT_MAX_LENGTH,
    COMMENT_TEXT_MIN_LENGTH,
    V1CommentModel,
} from '@/api/CommentApi';
import { UserApi, V1ShortUser } from '@/api/UserApi';
import { ApiResponse, ErrorDetails } from '@/api/ApiService';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { computed, inject, reactive, ref, watch, type Ref } from 'vue';

export type CommentsAuthorMap = Record<string, V1ShortUser>;

type RepliesState = {
    items: V1CommentModel[];
    cursorId: CommentId | null;
    hasMore: boolean;
    isLoading: boolean;
    isExpanded: boolean;
};

function toAuthorKey(authorId: CommentId): string {
    return String(authorId);
}

/** Backend expects long[]; keep unsafe int64 values as digit-strings. */
function toUserApiIds(ids: string[]): Array<number | string> {
    return ids.map((id) => {
        if (!/^-?\d+$/.test(id)) {
            return id;
        }
        const asNumber = Number(id);
        return Number.isSafeInteger(asNumber) ? asNumber : id;
    });
}

function validateCommentText(text: string): string | null {
    const trimmed = text.trim();
    if (trimmed.length < COMMENT_TEXT_MIN_LENGTH || trimmed.length > COMMENT_TEXT_MAX_LENGTH) {
        return `Текст комментария должен быть от ${COMMENT_TEXT_MIN_LENGTH} до ${COMMENT_TEXT_MAX_LENGTH} символов`;
    }
    return null;
}

export function useComments(
    targetType: Ref<CommentableTargetType> | CommentableTargetType,
    targetId: Ref<CommentId> | CommentId
) {
    const injectedCommentApi = inject<CommentApi>('comment-api');
    const injectedUserApi = inject<UserApi>('user-api');
    if (!injectedCommentApi || !injectedUserApi) {
        throw new Error('Comments: провайдеры comment-api или user-api не найдены');
    }
    const commentApi = injectedCommentApi;
    const userApi = injectedUserApi;

    const eventStore = ClientEventStore();

    const resolvedTargetType = computed(() =>
        typeof targetType === 'object' && targetType !== null && 'value' in targetType
            ? targetType.value
            : targetType
    );
    const resolvedTargetId = computed(() =>
        typeof targetId === 'object' && targetId !== null && 'value' in targetId
            ? targetId.value
            : targetId
    );

    const roots = ref<V1CommentModel[]>([]);
    const rootCursorId = ref<CommentId | null>(null);
    const hasMoreRoots = ref(false);
    const isLoadingRoots = ref(false);
    const isInitialized = ref(false);
    const authors = ref<CommentsAuthorMap>({});
    const repliesByParentId = reactive<Record<string, RepliesState>>({});

    function getRepliesState(parentId: CommentId): RepliesState {
        const key = String(parentId);
        if (!repliesByParentId[key]) {
            repliesByParentId[key] = {
                items: [],
                cursorId: null,
                hasMore: false,
                isLoading: false,
                isExpanded: false,
            };
        }
        return repliesByParentId[key];
    }

    function handleApiError<T>(response: ApiResponse<T>, fallbackMessage: string): boolean {
        response
            .onException(() => eventStore.push(fallbackMessage, EventTypes.Error))
            .onBusinessError((errorDetails: ErrorDetails) =>
                eventStore.push(errorDetails.Message || fallbackMessage, EventTypes.Error)
            );

        return Boolean(response.error);
    }

    async function ensureAuthors(comments: V1CommentModel[]): Promise<void> {
        const missingIds = Array.from(
            new Set(
                comments
                    .map((comment) => toAuthorKey(comment.AuthorId))
                    .filter((authorId) => authorId !== '' && authorId !== 'undefined' && authorId !== 'null')
                    .filter((authorId) => !authors.value[authorId])
            )
        );

        if (missingIds.length === 0) {
            return;
        }

        const chunkSize = 100;
        for (let offset = 0; offset < missingIds.length; offset += chunkSize) {
            const chunk = missingIds.slice(offset, offset + chunkSize);
            const response = await userApi.getShortUsers({
                UserIds: toUserApiIds(chunk),
            });
            if (handleApiError(response, 'Не удалось загрузить авторов комментариев')) {
                continue;
            }

            const loadedUsers = response.data?.Users ?? [];
            if (loadedUsers.length === 0) {
                continue;
            }

            const nextAuthors: CommentsAuthorMap = { ...authors.value };
            for (const shortUser of loadedUsers) {
                nextAuthors[toAuthorKey(shortUser.UserId)] = shortUser;
            }
            authors.value = nextAuthors;
        }
    }

    function upsertRoot(comment: V1CommentModel): void {
        const existingIndex = roots.value.findIndex((item) => String(item.Id) === String(comment.Id));
        if (existingIndex >= 0) {
            roots.value.splice(existingIndex, 1, comment);
            return;
        }
        roots.value = [comment, ...roots.value];
    }

    function replaceCommentEverywhere(comment: V1CommentModel): void {
        const rootIndex = roots.value.findIndex((item) => String(item.Id) === String(comment.Id));
        if (rootIndex >= 0) {
            roots.value.splice(rootIndex, 1, comment);
        }

        for (const state of Object.values(repliesByParentId)) {
            const replyIndex = state.items.findIndex((item) => String(item.Id) === String(comment.Id));
            if (replyIndex >= 0) {
                state.items.splice(replyIndex, 1, comment);
            }
        }
    }

    function insertReply(parentCommentId: CommentId, comment: V1CommentModel): void {
        const state = getRepliesState(parentCommentId);
        const existingIndex = state.items.findIndex((item) => String(item.Id) === String(comment.Id));
        if (existingIndex >= 0) {
            state.items.splice(existingIndex, 1, comment);
            return;
        }
        state.items = [comment, ...state.items];
        state.isExpanded = true;
        bumpRepliesCount(parentCommentId, 1);
    }

    function bumpRepliesCount(commentId: CommentId, delta: number): void {
        const apply = (comment: V1CommentModel): V1CommentModel => ({
            ...comment,
            RepliesCount: Math.max(0, (comment.RepliesCount ?? 0) + delta),
        });

        const rootIndex = roots.value.findIndex((item) => String(item.Id) === String(commentId));
        if (rootIndex >= 0) {
            roots.value.splice(rootIndex, 1, apply(roots.value[rootIndex]));
        }

        for (const state of Object.values(repliesByParentId)) {
            const replyIndex = state.items.findIndex((item) => String(item.Id) === String(commentId));
            if (replyIndex >= 0) {
                state.items.splice(replyIndex, 1, apply(state.items[replyIndex]));
            }
        }
    }

    function normalizeComments(comments: V1CommentModel[]): V1CommentModel[] {
        return comments.map((comment) => ({
            ...comment,
            RepliesCount: comment.RepliesCount ?? 0,
        }));
    }

    function findComment(commentId: CommentId): V1CommentModel | undefined {
        const root = roots.value.find((item) => String(item.Id) === String(commentId));
        if (root) {
            return root;
        }
        for (const state of Object.values(repliesByParentId)) {
            const reply = state.items.find((item) => String(item.Id) === String(commentId));
            if (reply) {
                return reply;
            }
        }
        return undefined;
    }

    function resolveIncomingComment(comment: V1CommentModel): V1CommentModel {
        const existing = findComment(comment.Id);
        return {
            ...comment,
            RepliesCount: comment.RepliesCount ?? existing?.RepliesCount ?? 0,
        };
    }

    async function loadRoots(reset = false): Promise<void> {
        if (isLoadingRoots.value) {
            return;
        }

        isLoadingRoots.value = true;
        try {
            const cursorId = reset ? null : rootCursorId.value;
            const response = await commentApi.queryRoots({
                TargetType: resolvedTargetType.value,
                TargetId: resolvedTargetId.value,
                CursorId: cursorId,
                Limit: COMMENT_PAGE_LIMIT,
            });

            if (handleApiError(response, 'Не удалось загрузить комментарии')) {
                return;
            }

            const page = normalizeComments(response.data?.Comments ?? []);
            roots.value = reset ? page : [...roots.value, ...page];
            hasMoreRoots.value = page.length >= COMMENT_PAGE_LIMIT;
            rootCursorId.value = page.length > 0 ? page[page.length - 1].Id : rootCursorId.value;
            await ensureAuthors(page);
        } finally {
            isLoadingRoots.value = false;
            isInitialized.value = true;
        }
    }

    async function loadMoreRoots(): Promise<void> {
        if (!hasMoreRoots.value) {
            return;
        }
        await loadRoots(false);
    }

    async function loadReplies(parentCommentId: CommentId, reset = false): Promise<void> {
        const state = getRepliesState(parentCommentId);
        if (state.isLoading) {
            return;
        }

        state.isLoading = true;
        state.isExpanded = true;

        try {
            const cursorId = reset ? null : state.cursorId;
            const response = await commentApi.queryReplies({
                ParentCommentId: parentCommentId,
                CursorId: cursorId,
                Limit: COMMENT_PAGE_LIMIT,
            });

            if (handleApiError(response, 'Не удалось загрузить ответы')) {
                return;
            }

            const page = normalizeComments(response.data?.Comments ?? []);
            state.items = reset ? page : [...state.items, ...page];
            state.hasMore = page.length >= COMMENT_PAGE_LIMIT;
            state.cursorId = page.length > 0 ? page[page.length - 1].Id : state.cursorId;
            await ensureAuthors(page);
        } finally {
            state.isLoading = false;
        }
    }

    async function expandReplies(parentCommentId: CommentId): Promise<void> {
        const state = getRepliesState(parentCommentId);
        if (state.isExpanded && state.items.length > 0) {
            return;
        }
        await loadReplies(parentCommentId, true);
    }

    async function loadMoreReplies(parentCommentId: CommentId): Promise<void> {
        const state = getRepliesState(parentCommentId);
        if (!state.hasMore) {
            return;
        }
        await loadReplies(parentCommentId, false);
    }

    async function createComment(text: string, parentCommentId: CommentId | null = null): Promise<boolean> {
        const validationError = validateCommentText(text);
        if (validationError) {
            eventStore.push(validationError, EventTypes.Error);
            return false;
        }

        const response = await commentApi.create({
            TargetType: resolvedTargetType.value,
            TargetId: resolvedTargetId.value,
            ParentCommentId: parentCommentId,
            Text: text.trim(),
        });

        if (handleApiError(response, 'Не удалось отправить комментарий')) {
            return false;
        }

        const created = response.data?.Comment;
        if (!created) {
            eventStore.push('Не удалось отправить комментарий', EventTypes.Error);
            return false;
        }

        const comment = resolveIncomingComment(created);
        await ensureAuthors([comment]);

        if (parentCommentId == null) {
            upsertRoot(comment);
        } else {
            insertReply(parentCommentId, comment);
        }

        return true;
    }

    async function updateComment(commentId: CommentId, text: string): Promise<boolean> {
        const validationError = validateCommentText(text);
        if (validationError) {
            eventStore.push(validationError, EventTypes.Error);
            return false;
        }

        const response = await commentApi.update({
            CommentId: commentId,
            Text: text.trim(),
        });

        if (handleApiError(response, 'Не удалось обновить комментарий')) {
            return false;
        }

        const updated = response.data?.Comment;
        if (!updated) {
            eventStore.push('Не удалось обновить комментарий', EventTypes.Error);
            return false;
        }

        replaceCommentEverywhere(resolveIncomingComment(updated));
        return true;
    }

    async function deleteComment(commentId: CommentId): Promise<boolean> {
        const response = await commentApi.delete({ CommentId: commentId });
        if (handleApiError(response, 'Не удалось удалить комментарий')) {
            return false;
        }

        const deleted = response.data?.Comment;
        if (!deleted) {
            eventStore.push('Не удалось удалить комментарий', EventTypes.Error);
            return false;
        }

        replaceCommentEverywhere(resolveIncomingComment(deleted));
        return true;
    }

    function resetState(): void {
        roots.value = [];
        rootCursorId.value = null;
        hasMoreRoots.value = false;
        isLoadingRoots.value = false;
        isInitialized.value = false;
        authors.value = {};
        for (const key of Object.keys(repliesByParentId)) {
            delete repliesByParentId[key];
        }
    }

    async function initialize(): Promise<void> {
        resetState();
        await loadRoots(true);
    }

    watch(
        [resolvedTargetType, resolvedTargetId],
        async () => {
            await initialize();
        },
        { immediate: true }
    );

    return {
        roots,
        authors,
        repliesByParentId,
        hasMoreRoots,
        isLoadingRoots,
        isInitialized,
        getRepliesState,
        loadMoreRoots,
        expandReplies,
        loadMoreReplies,
        createComment,
        updateComment,
        deleteComment,
        initialize,
        validateCommentText,
    };
}

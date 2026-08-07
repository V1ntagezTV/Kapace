import { ApiResponse, ApiService } from '@/api/ApiService';

export type CommentableTargetType = 'Content' | 'Episode' | 'Person' | 'Image';

export type CommentStatus = 'Published' | 'Hidden' | 'Deleted';

export type CommentId = string | number;

export type V1CommentModel = {
    Id: CommentId;
    AuthorId: CommentId;
    TargetType: CommentableTargetType;
    TargetId: CommentId;
    ParentCommentId: CommentId | null;
    RootCommentId: CommentId;
    Depth: number;
    Text: string;
    Status: CommentStatus;
    RepliesCount: number;
    CreatedAt: string;
    UpdatedAt: string | null;
    DeletedAt: string | null;
};

export type V1CreateCommentRequest = {
    TargetType: CommentableTargetType;
    TargetId: CommentId;
    ParentCommentId?: CommentId | null;
    Text: string;
};

export type V1CreateCommentResponse = {
    Comment: V1CommentModel;
};

export type V1QueryCommentRootsRequest = {
    TargetType: CommentableTargetType;
    TargetId: CommentId;
    CursorId?: CommentId | null;
    Limit?: number;
};

export type V1QueryCommentRootsResponse = {
    Comments: V1CommentModel[];
};

export type V1QueryCommentRepliesRequest = {
    ParentCommentId: CommentId;
    CursorId?: CommentId | null;
    Limit?: number;
};

export type V1QueryCommentRepliesResponse = {
    Comments: V1CommentModel[];
};

export type V1UpdateCommentRequest = {
    CommentId: CommentId;
    Text: string;
};

export type V1UpdateCommentResponse = {
    Comment: V1CommentModel;
};

export type V1DeleteCommentRequest = {
    CommentId: CommentId;
};

export type V1DeleteCommentResponse = {
    Comment: V1CommentModel;
};

export const COMMENT_PAGE_LIMIT = 20;
export const COMMENT_MAX_DEPTH = 5;
export const COMMENT_TEXT_MIN_LENGTH = 1;
export const COMMENT_TEXT_MAX_LENGTH = 2000;

export class CommentApi extends ApiService {
    constructor() {
        super('v1/comment/');
    }

    public async create(request: V1CreateCommentRequest): Promise<ApiResponse<V1CreateCommentResponse>> {
        return await this.fetchV2<V1CreateCommentResponse, V1CreateCommentRequest>(request, 'create');
    }

    public async queryRoots(
        request: V1QueryCommentRootsRequest
    ): Promise<ApiResponse<V1QueryCommentRootsResponse>> {
        return await this.fetchV2<V1QueryCommentRootsResponse, V1QueryCommentRootsRequest>(
            request,
            'query-roots'
        );
    }

    public async queryReplies(
        request: V1QueryCommentRepliesRequest
    ): Promise<ApiResponse<V1QueryCommentRepliesResponse>> {
        return await this.fetchV2<V1QueryCommentRepliesResponse, V1QueryCommentRepliesRequest>(
            request,
            'query-replies'
        );
    }

    public async update(request: V1UpdateCommentRequest): Promise<ApiResponse<V1UpdateCommentResponse>> {
        return await this.fetchV2<V1UpdateCommentResponse, V1UpdateCommentRequest>(request, 'update');
    }

    public async delete(request: V1DeleteCommentRequest): Promise<ApiResponse<V1DeleteCommentResponse>> {
        return await this.fetchV2<V1DeleteCommentResponse, V1DeleteCommentRequest>(request, 'delete');
    }
}

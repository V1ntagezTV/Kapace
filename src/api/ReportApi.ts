import { ApiResponse, ApiService } from '@/api/ApiService';

export type ReportTargetType = 'Content' | 'Episode' | 'User' | 'Person';

export type ReportReason = 'Spam' | 'Abuse' | 'IncorrectInfo' | 'Copyright' | 'Other';

export type CreateReportRequest = {
    TargetType: ReportTargetType;
    TargetId: string | number;
    Reason: ReportReason;
    Comment: string;
};

export type CreateReportResponse = {
    ReportId: number;
};

export class ReportApi extends ApiService {
    constructor() {
        super('v1/report/');
    }

    public async create(request: CreateReportRequest): Promise<ApiResponse<CreateReportResponse>> {
        return await this.fetchV2<CreateReportResponse, CreateReportRequest>(request, 'create');
    }
}

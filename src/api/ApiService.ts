import { AuthSession } from "@/api/AuthSession";

export class ApiService {
    protected hostPath: string = process.env.VUE_APP_SERVER_API_ADDRESS;

    constructor(protected servicePath: string) {
        console.log(this.hostPath);
    }

    private stringifyRequestBody<TRequest>(requestBody: TRequest): string {
        const body = requestBody === undefined ? {} : requestBody;
        return JSON.stringify(body, (_, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }

            if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
                return value.toString();
            }

            return value;
        });
    }

    private parseJsonWithSafeIds<TResponse>(jsonText: string): TResponse {
        // JS number cannot precisely represent int64 values, so coerce large numeric *Id fields to strings before parsing.
        const normalizedJsonText = jsonText
            .replace(
                /"([A-Za-z0-9_]*Ids?)"\s*:\s*(-?\d{16,})/g,
                (_, key: string, idValue: string) => `"${key}":"${idValue}"`
            )
            .replace(
                /"GeneratedId"\s*:\s*(-?\d+)/g,
                (_, idValue: string) => `"GeneratedId":"${idValue}"`
            );

        return JSON.parse(normalizedJsonText) as TResponse;
    }

    private baseFetch<TRequest>(
        requestBody: TRequest,
        handlerPath: string,
        headers: Headers | null = null
    ) {
        const path = this.hostPath + this.servicePath + handlerPath;
        const requestHeaders: HeadersInit = headers !== null ? headers : new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');

        return fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            credentials: 'include',
            body: this.stringifyRequestBody(requestBody),
        });
    }

    private async CallHandler<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const response = this.baseFetch(requestBody, handlerPath);

        return response
            .then(response => response.json())
            .then(response => response as TResponse);
    }

    private static readonly genericServerError: ErrorDetails = {
        ErrorCode: "0",
        Message: "Что-то пошло не так! Ошибка сервера.",
        ErrorDetails: new Map<string, string>()
    };

    private static readonly unauthorizedBusinessError: ErrorDetails = {
        ErrorCode: "Unauthorized",
        Message: "Для начала необходимо авторизоваться!",
        ErrorDetails: new Map<string, string>()
    };

    private shouldSkipAuthRefresh(handlerPath: string): boolean {
        return handlerPath === 'refresh-cookie' || handlerPath === 'cookie-logout';
    }

    private wrapApiResponse<TResponse>(
        data: TResponse | undefined,
        error: ErrorDetails | undefined,
        businessError: ErrorDetails | undefined,
        exception: any
    ): ApiResponse<TResponse> {
        const apiResponse: ApiResponse<TResponse> = {
            data,
            error,
            businessError,
            onException: (callback) => {
                if (exception) {
                    callback();
                }

                return apiResponse;
            },
            onBusinessError: (callback) => {
                if (businessError) {
                    callback(businessError);
                }

                return apiResponse;
            }
        };

        return apiResponse;
    }

    private async parseResponseToApiResult<TResponse>(
        response: Response | undefined,
        exception: any
    ): Promise<{
        data: TResponse | undefined;
        error: ErrorDetails | undefined;
        businessError: ErrorDetails | undefined;
    }> {
        const genericServerError = ApiService.genericServerError;

        let data: TResponse | undefined = undefined;
        let error: ErrorDetails | undefined = undefined;
        let businessError: ErrorDetails | undefined = undefined;

        if (!exception && response) {
            if (response.status === 200) {
                try {
                    const contentLength = response.headers.get('Content-Length');
                    if (contentLength === '0' || !response.body) {
                        data = {} as TResponse;
                    } else {
                        const responseText = await response.text();
                        data = responseText
                            ? this.parseJsonWithSafeIds<TResponse>(responseText)
                            : {} as TResponse;
                    }
                } catch (e) {
                    data = {} as TResponse;
                    console.error("JSON parsing error:", e);
                }
            } else if (response.status === 400) {
                try {
                    businessError = await response.json() as ErrorDetails;
                } catch (e) {
                    console.error("JSON parsing error (400):", e);
                    businessError = { ...genericServerError };
                }
                error = genericServerError;
            } else if (response.status === 401) {
                businessError = { ...ApiService.unauthorizedBusinessError };
                error = genericServerError;
            } else {
                error = genericServerError;
            }
        }

        return { data, error, businessError };
    }

    private unauthorizedApiResponse<TResponse>(): ApiResponse<TResponse> {
        const genericServerError = ApiService.genericServerError;
        const businessError = { ...ApiService.unauthorizedBusinessError };
        return this.wrapApiResponse<TResponse>(undefined, genericServerError, businessError, undefined);
    }

    private async CallHandlerV2<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string,
        headers: Headers | null = null): Promise<ApiResponse<TResponse>> {
        let response: Response | undefined = undefined;
        let exception: any;

        try {
            response = await this.baseFetch(requestBody, handlerPath, headers);
            console.log({ Path: handlerPath, Request: requestBody, Response: response });
        } catch (e) {
            exception = e;
        }

        const skipAuthRefresh = this.shouldSkipAuthRefresh(handlerPath);

        if (!exception && response?.status === 401 && !skipAuthRefresh) {
            const refreshed = await AuthSession.refresh();
            if (!refreshed) {
                await AuthSession.handleAuthLost();
                return this.unauthorizedApiResponse<TResponse>();
            }

            try {
                response = await this.baseFetch(requestBody, handlerPath, headers);
                console.log({ Path: handlerPath, Request: requestBody, Response: response, RetriedAfterRefresh: true });
            } catch (e) {
                exception = e;
                response = undefined;
            }

            if (!exception && response?.status === 401) {
                await AuthSession.handleAuthLost();
                return this.unauthorizedApiResponse<TResponse>();
            }
        }

        const parsed = await this.parseResponseToApiResult<TResponse>(response, exception);
        return this.wrapApiResponse<TResponse>(parsed.data, parsed.error, parsed.businessError, exception);
    }

    // Obsolete
    protected async CallHandlerAsync<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const response = await this.CallHandler<TResponse, TRequest>(requestBody, handlerPath);
        console.log({ path: this.servicePath + handlerPath, request: requestBody, response: response });
        return response;
    }

    protected async fetchV2<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string,
        headers: Headers | null = null): Promise<ApiResponse<TResponse>> {
        return await this.CallHandlerV2<TResponse, TRequest>(requestBody, handlerPath, headers);
    }

    protected async CallPostHandlerAsync<TRequest>(requestBody: TRequest, handlerPath: string): Promise<Response> {
        const response = await this.baseFetch<TRequest>(requestBody, handlerPath);
        console.log({ path: this.servicePath + handlerPath, request: requestBody, response: response });
        return response;
    }

    protected async CallHandlerByFormDataAsync<TResponse>(
        handlerPath: string,
        formData: FormData) {
        const path = this.hostPath + this.servicePath + handlerPath;

        await fetch(path, {
            method: "POST",
            body: formData
        })
            .then(result => console.log(result))
            .catch(error => console.log("error", error)
            );
    }

    public isErrorDetails(response: any): response is ErrorDetails {
        return (response as ErrorDetails).ErrorCode !== undefined;
    }
}

export interface ApiResponse<T> {
    data?: T;
    error?: ErrorDetails;
    /** Распарсенное тело при 400/401; доступно сразу после await fetchV2 */
    businessError?: ErrorDetails;
    onException(callback: (error: void) => void): ApiResponse<T>;
    onBusinessError(callback: (error: ErrorDetails) => void): ApiResponse<T>;
}

export interface ErrorDetails {
    ErrorCode: string,
    Message: string,
    ErrorDetails: Map<string, string>
}

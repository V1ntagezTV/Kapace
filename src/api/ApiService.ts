export class ApiService {
    protected hostPath: string = "http://localhost:5000/";

    constructor(protected servicePath: string) { }

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
            credentials:
                handlerPath !== "http://89.111.174.191/v1/user/update-mail/new-email-send-code" &&
                handlerPath !== "http://89.111.174.191/v1/user/update-mail/new-email-verify-code"
                    ? 'include' : 'omit',
            body: requestBody === undefined ? JSON.stringify({}) : JSON.stringify(requestBody),
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

    private async CallHandlerV2<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string,
        headers: Headers | null = null) : Promise<ApiResponse<TResponse>> {
        let response: Response | undefined = undefined;
        let exception: any;

        try {
            response = await this.baseFetch(requestBody, handlerPath, headers);
            console.log({
                Path: handlerPath,
                Request: requestBody,
                Response: response
            });
        } catch (e) {
            exception = e;
        }

        const apiResponse: ApiResponse<TResponse> = {
            onException: (callback) => {
                if (exception) {
                    callback();
                }

                return apiResponse;
            },
            onBusinessError: (callback) => {
                if (response && response.status === 400) {
                    response.json().then(model => {
                        callback(model);
                    });
                }

                if (response && response.status === 401) {
                    callback({
                        ErrorCode: "Unauthorized",
                        Message: "Для начала необходимо авторизоваться!",
                        ErrorDetails: new Map<string, string>()
                    });
                }

                return apiResponse;
            }
        };

        if (response && response.status === 200) {
            try {
                const contentLength = response.headers.get('Content-Length');
                if (contentLength === '0' || !response.body) {
                    apiResponse.data = {} as TResponse;
                } else {
                    apiResponse.data = await response.json() as TResponse;
                }
            } catch (e) {
                // Если парсинг не удался, обрабатываем как пустой ответ
                apiResponse.data = {} as TResponse;
                console.error("JSON parsing error:", e);
            }
        } else {
            apiResponse.error = {
                ErrorCode: "0",
                Message: "Что-то пошло не так! Ошибка сервера.",
                ErrorDetails: new Map<string, string>()
            };
        }

        return apiResponse;
    }

    // Obsolete
    protected async CallHandlerAsync<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const response = await this.CallHandler<TResponse, TRequest>(requestBody, handlerPath);
        console.log({path: this.servicePath + handlerPath, request: requestBody, response: response});
        return response;
    }

    protected async fetchV2<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string,
        headers: Headers | null = null) : Promise<ApiResponse<TResponse>> {
        return await this.CallHandlerV2<TResponse, TRequest>(requestBody, handlerPath, headers);
    }

    protected async CallPostHandlerAsync<TRequest>(requestBody: TRequest, handlerPath: string) : Promise<Response> {
        const response = await this.baseFetch<TRequest>(requestBody, handlerPath);
        console.log({path: this.servicePath + handlerPath, request: requestBody, response: response});
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
    onException(callback: (error: void) => void): ApiResponse<T>;
    onBusinessError(callback: (error: ErrorDetails) => void): ApiResponse<T>;
}

export interface ErrorDetails {
    ErrorCode: string,
    Message: string,
    ErrorDetails: Map<string, string>
}
export class ApiService {
    private hostPath: string = "http://localhost:5000/";

    constructor(protected servicePath: string) { }

    private CallHandler<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const path = this.hostPath + this.servicePath + handlerPath;
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        const requestJson = JSON.stringify(requestBody);

        return fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            body: requestJson,
        })
            .then(response => response.json())
            .then(response => response as TResponse);
    }

    protected async CallHandlerAsync<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const response = await this.CallHandler<TResponse, TRequest>(requestBody, handlerPath);
        console.log({path: this.servicePath + handlerPath, request: requestBody, response: response});
        return response;
    }

    protected async CallPostHandlerAsync<TRequest>(requestBody: TRequest, handlerPath: string) {
        const response = await this.CallHandler<Object, TRequest>(requestBody, handlerPath);
        console.log({path: this.servicePath + handlerPath, request: requestBody, response: response});
    }

    protected async CallHandlerByFormDataAsync<TResponse>(
        handlerPath: string,
        formData: FormData,
    ) {
        const path = this.hostPath + this.servicePath + handlerPath;

        await fetch(path, {
            method: "POST",
            body: formData
        })
            .then(result => console.log(result))
            .catch(error => console.log("error", error)
        );
    }
}
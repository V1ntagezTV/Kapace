export class ApiController {
    constructor(protected basePath: string = "http://localhost:5000/v1/content/") { }

    private CallHandler<TResponse, TRequest>(
        requestBody: TRequest,
        handlerPath: string): Promise<TResponse> {
        const path = this.basePath + handlerPath;
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
        console.log('HANDLER REQUEST: ' + handlerPath + ' BODY: ' + JSON.stringify(requestBody));

        const response = await this.CallHandler<TResponse, TRequest>(requestBody, handlerPath);

        console.log('HANDLER RESPONSE: ' + handlerPath + ' BODY: ' + JSON.stringify(response))

        return response;
    }
}
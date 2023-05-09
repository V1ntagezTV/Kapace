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
        console.log('HANDLER REQUEST: ' + this.servicePath + handlerPath + '\nBODY: ' + JSON.stringify(requestBody));

        const response = await this.CallHandler<TResponse, TRequest>(requestBody, handlerPath);

        console.log('HANDLER RESPONSE: ' + this.servicePath + handlerPath + '\nBODY: ' + JSON.stringify(response))

        return response;
    }
}
import {ApiService} from "@/api/ApiService";

export class UserApi extends ApiService {
    constructor() {
        super('v1/user/');
    }
    public async logIn(email: string, password: string) {
        const path = this.hostPath + this.servicePath + 'login-by-cookie';
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');

        const request = {
            Email: email,
            Password: password
        };

        const requestJson = JSON.stringify(request);
        console.log(requestJson);
        return await fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            body: requestJson,
            credentials: "include"
        })
            .then(response => response.json())
            .then(response => {console.log(response)});
    }

    public async getCurrent() : Promise<GetCurrentResponse> {
        const path = this.hostPath + this.servicePath + 'current';
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');

        return await fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            credentials: "include"
        })
            .then(response => response.json())
            .then(response => response as GetCurrentResponse)
    }
}

export type GetCurrentResponse = {
    User: GetCurrentUser,
    Roles: GetCurrentPermission[]
}

export type GetCurrentUser = {
    Id: number,
    Nickname: string,
    Email: string,
    CreatedAt: number
}

export type GetCurrentPermission = {
    Id: number,
    Alias: string
}

export type LogInRequest = {
    Nickname: string,
    Password: string
}
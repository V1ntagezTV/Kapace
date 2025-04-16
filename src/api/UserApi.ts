import {ApiResponse, ApiService, ErrorDetails} from "@/api/ApiService";

export class UserApi extends ApiService {
    constructor() {
        super('v1/user/');
    }
    public async logIn(email: string, password: string, isRememberMe: boolean) : Promise<Response | ErrorDetails> {
        const path = this.hostPath + this.servicePath + 'login-by-cookie';
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');

        const request = {
            Email: email,
            Password: password,
            IsRememberMe: isRememberMe
        };

        const requestJson = JSON.stringify(request);
        const response = await fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            body: requestJson,
            credentials: "include"
        });

        if (response.status === 400) {
            const model = await response.json() as ErrorDetails;
            console.log({path: response.url, response: model});
            return model;
        } else if (response.status === 200) {
            return response;
        } else {
            return {
                ErrorCode: "0",
                Message: "Что-то пошло не так! Ошибка сервера.",
                ErrorDetails: new Map<string, string>()
            };
        }
    }

    public async getCurrent() : Promise<ApiResponse<GetCurrentResponse>> {
        return await this.fetchV2<GetCurrentResponse, {}>({}, 'current');
    }

    public async registration(
        nickname: string,
        email: string,
        password: string) : Promise<any> {
        await this.CallPostHandlerAsync({
            email: email,
            nickname: nickname,
            password: password
        }, 'register');
    }

    async sendPasswordResetCode(email: string) {
        return await this.CallPostHandlerAsync({
            email: email,
        }, 'reset-password/send-code');
    }

    async verifyPasswordResetCode(email: string, code: number)
        : Promise<ApiResponse<VerifyPasswordResetCodeResponse>> {
        return await this.fetchV2<VerifyPasswordResetCodeResponse, VerifyPasswordResetCodeRequest>(
            {Email: email, Code: code},
            'reset-password/verify-code'
        );
    }

    async resetPassword(email: string, newPassword: string, passwordResetTemporaryToken: string) {
        const path = this.hostPath + this.servicePath + 'reset-password/finish';
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        requestHeaders.set('Authorization', 'Bearer ' + passwordResetTemporaryToken);
        const requestBody = JSON.stringify({Email: email, NewPassword: newPassword});
        const response = await fetch(path, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        });

        console.log({path: path, request: requestBody, response: response});
    }

    async UpdateNickname(newNickname: string, isForce: boolean) : Promise<ApiResponse<{}>> {
        return await this.fetchV2<{}, {}>(
            {NewNickname: newNickname, IsForce: isForce},
            'update-nickname'
        );
    }

    async SendUpdateMailCode() : Promise<ApiResponse<{}>> {
        return await this.fetchV2<{}, {}>({}, 'update-mail/old-email-send-code');
    }

    async VerifyOldMailCode(inputCode: string) : Promise<ApiResponse<{Token: string}>> {
        return await this.fetchV2<{Token: string}, {}>(
            {Code: inputCode},
            'update-mail/old-email-verify-code'
        );
    }

    async SendNewMailCode(newMail: string, authToken: string) {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Authorization', 'Bearer ' + authToken);

        return await this.fetchV2<{}, {}>(
            {NewMail: newMail},
            'update-mail/new-email-send-code',
            requestHeaders);
    }

    async VerifyNewMailCode(newMail: string, inputCode: string, authToken: string) {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Authorization', 'Bearer ' + authToken);

        return await this.fetchV2<{}, {}>(
            {
                NewMail: newMail,
                Code: inputCode
            },
            'update-mail/new-email-verify-code',
            requestHeaders
        );
    }
}

export type VerifyPasswordResetCodeRequest = {
    Email: string,
    Code: number
}

export type VerifyPasswordResetCodeResponse = {
    Token: string
}

export type GetCurrentResponse = {
    User: GetCurrentUser,
    Roles: GetCurrentPermission[]
}

export type GetCurrentUser = {
    Id: number,
    Nickname: string,
    Email: string,
    CreatedAt: number,
    IsMailVerified: boolean,
    ImageUrl: string
}

export type GetCurrentPermission = {
    Id: number,
    Alias: string
}
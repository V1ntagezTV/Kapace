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

    public async loginByBearer(
        email: string,
        password: string,
        isRememberMe: boolean
    ): Promise<LoginByBearerResponse | ErrorDetails> {
        const path = this.hostPath + this.servicePath + 'login-by-bearer';
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');

        try {
            const response = await fetch(path, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify({
                    Email: email,
                    Password: password,
                    IsRememberMe: isRememberMe
                }),
                credentials: "include"
            });

            if (response.status === 200) {
                const model = await response.json() as LoginByBearerApiResponse;
                const bearerToken = model.BearerToken ?? model.Token;
                if (typeof bearerToken === "string" && bearerToken.trim()) {
                    return {
                        BearerToken: bearerToken,
                        UserId: model.UserId
                    };
                }
            }

            if (response.status === 400) {
                return await response.json() as ErrorDetails;
            }
        } catch {
            // Credentials and bearer tokens must not be written to logs.
        }

        return {
            ErrorCode: "0",
            Message: "Что-то пошло не так! Ошибка сервера.",
            ErrorDetails: new Map<string, string>()
        };
    }

    public async getCurrent() : Promise<ApiResponse<GetCurrentResponse>> {
        return await this.fetchV2<GetCurrentResponse, {}>({}, 'current');
    }

    public async registration(
        nickname: string,
        email: string,
        password: string) : Promise<ApiResponse<{Token: string}>> {
        return await this.fetchV2<{Token: string}, {}>({
                email: email,
                nickname: nickname,
                password: password
            },
            'registration/create',
        );
    }

    async sendPasswordResetCode(email: string) : Promise<ApiResponse<{}>> {
        return await this.fetchV2({
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

    async resetPassword(email: string, newPassword: string, passwordResetTemporaryToken: string) : Promise<ApiResponse<any>> {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        requestHeaders.set('Authorization', 'Bearer ' + passwordResetTemporaryToken);

        return await this.fetchV2(
            { Email: email, NewPassword: newPassword },
            'reset-password/finish',
            requestHeaders
        );
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

    async sendMailVerifyCode(authTempToken: string) {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        requestHeaders.set('Authorization', 'Bearer ' + authTempToken);
        return await this.fetchV2<{}, {}>({}, 'registration/send-verify-code', requestHeaders);
    }

    async verifyRegistrationCode(verifyCode: string, authTempToken: string) {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        requestHeaders.set('Authorization', 'Bearer ' + authTempToken);
        return await this.fetchV2<{}, {VerificationCode: string}>(
            {VerificationCode: verifyCode},
            'registration/verify-mail',
            requestHeaders
        );
    }

    async UpdatePassword(oldPassword: string, newPassword: string) {
        return await this.fetchV2<{}, {OldPassword: string, NewPassword: string}>(
            {
                OldPassword: oldPassword,
                NewPassword: newPassword
            },
            'registration/verify-mail'
        );
    }

    async logout() : Promise<ApiResponse<{}>> {
        return await this.fetchV2<{}, {}>({}, 'cookie-logout');
    }

    async getShortUsers(request: V1GetShortUsersRequest): Promise<ApiResponse<V1GetShortUsersResponse>> {
        return await this.fetchV2<V1GetShortUsersResponse, V1GetShortUsersRequest>(
            request,
            'get-short-users'
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

export type LoginByBearerResponse = {
    BearerToken: string,
    UserId: number
}

type LoginByBearerApiResponse = {
    BearerToken?: string,
    Token?: string,
    UserId: number
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
    ImageUrl: string | null
}

export type GetCurrentPermission = {
    Id: number,
    Alias: string
}

export type V1GetShortUsersRequest = {
    /** long[] on backend; send numbers for safe integers */
    UserIds: Array<number | string>;
}

export type V1ShortUser = {
    UserId: number | string;
    Nickname: string;
    ImageLink: string | null;
}

export type V1GetShortUsersResponse = {
    Users: V1ShortUser[];
}
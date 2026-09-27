import {AuthTokens} from "./auth-utils";
import {config} from "../../config/config";
import {
    EditCreateResponseBody,
    LoginResponseBody,
    RefreshResponseBody,
    ResponseBody
} from "../../types/response-body.type";
import {ResponseUtilsObjectHeadersType, ResponseUtilsObjectType} from "../../types/response-utils.type";
import {ErrorResultResponse} from "../../types/result-response.type";

type RequestBody = ResponseBody | LoginResponseBody | RefreshResponseBody | EditCreateResponseBody | null;

export class Response {
    public static async getElementsFromBackend<T = any>(
        method: string,
        url: string,
        accessToken: string | null,
        body: RequestBody = null,
        params: string | null = null
    ): Promise<T | ErrorResultResponse> {
        const requestUrl = config.api + url;
        const isPublicEndpoint = /^\/(login|signup|refresh|logout)(?:\/|$)/.test(url);
        let token = accessToken;

        if (!isPublicEndpoint) {
            token = await AuthTokens.ensureAccessToken();

            if (!token) {
                return {
                    error: true,
                    message: 'Сессия истекла',
                };
            }
        }

        const firstResult = await this.request<T>(method, requestUrl, token, body, params);

        if (!this.isAuthFailure(firstResult)) {
            return firstResult;
        }

        if (isPublicEndpoint) {
            return firstResult;
        }

        const refreshedToken = await AuthTokens.refreshToken();

        if (!refreshedToken) {
            return firstResult;
        }

        return this.request<T>(method, requestUrl, refreshedToken, body, params);
    }

    private static async request<T>(
        method: string,
        requestUrl: string,
        accessToken: string | null,
        body: RequestBody,
        params: string | null
    ): Promise<T | ErrorResultResponse> {
        const headers: ResponseUtilsObjectHeadersType = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (accessToken) {
            headers['x-auth-token'] = accessToken;
        }

        const requestOptions: ResponseUtilsObjectType = {
            method,
            headers,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        if (params) {
            requestOptions.params = JSON.stringify(params);
        }

        try {
            const response = await fetch(requestUrl, requestOptions);

            let result: T | ErrorResultResponse;
            try {
                result = await response.json() as T | ErrorResultResponse;
            } catch {
                return {
                    error: true,
                    message: 'Сервер вернул некорректный ответ',
                };
            }

            if (!response.ok) {
                if (this.isErrorResult(result)) {
                    return {
                        ...result,
                        status: response.status,
                    };
                }

                return {
                    error: true,
                    message: 'Ошибка сервера',
                    status: response.status,
                };
            }

            return result;
        } catch (error) {
            console.error('Request failed:', error);
            return {
                error: true,
                message: 'Ошибка соединения с сервером',
            };
        }
    }

    private static isAuthFailure(result: unknown): boolean {
        if (!this.isErrorResult(result)) {
            return false;
        }

        return result.status === 401 || /jwt expired|token expired|unauthorized/i.test(result.message);
    }

    private static isErrorResult(result: unknown): result is ErrorResultResponse & { status?: number } {
        return Boolean(result && typeof result === 'object' && 'error' in result && (result as { error: unknown }).error === true);
    }
}

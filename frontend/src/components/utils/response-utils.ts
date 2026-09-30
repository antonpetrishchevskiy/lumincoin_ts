import {AuthTokens} from "./auth-utils";
import {config} from "../../config/config";
import {ResponseUtilsObjectHeadersType, ResponseUtilsObjectType, HttpMethod} from "../../types/response-utils.type";
import {ErrorResultResponse} from "../../types/result-response.type";

type RequestBody = Record<string, unknown> | null;

export class Response {
    public static async getElementsFromBackend<T extends object = Record<string, unknown>>(
        method: HttpMethod,
        url: string,
        accessToken: string | null,
        body: RequestBody = null
    ): Promise<T | ErrorResultResponse> {
        const requestUrl = config.api + url;
        const isPublicEndpoint = /^\/(login|signup|refresh|logout)(?:\/|$)/.test(url);
        let token = accessToken;

        if (!isPublicEndpoint) {
            token = await AuthTokens.ensureAccessToken();
            if (!token) {
                return {error: true, message: 'Сессия истекла'};
            }
        }

        const firstResult = await this.request<T>(method, requestUrl, token, body);
        if (!this.isAuthFailure(firstResult) || isPublicEndpoint) {
            return firstResult;
        }

        const refreshedToken = await AuthTokens.refreshToken();
        if (!refreshedToken) {
            return firstResult;
        }

        return this.request<T>(method, requestUrl, refreshedToken, body);
    }

    private static async request<T extends object>(
        method: HttpMethod,
        requestUrl: string,
        accessToken: string | null,
        body: RequestBody
    ): Promise<T | ErrorResultResponse> {
        const headers: ResponseUtilsObjectHeadersType = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        if (accessToken) {
            headers['x-auth-token'] = accessToken;
        }

        const requestOptions: ResponseUtilsObjectType = {method, headers};
        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(requestUrl, requestOptions);
            const text = await response.text();

            if (!text) {
                return response.ok
                    ? {} as T
                    : {error: true, message: 'Сервер вернул пустой ответ', status: response.status};
            }

            let result: T | ErrorResultResponse;
            try {
                result = JSON.parse(text) as T | ErrorResultResponse;
            } catch {
                return {
                    error: true,
                    message: 'Сервер вернул некорректный ответ',
                    status: response.status,
                };
            }

            if (!response.ok) {
                if (this.isErrorResult(result)) {
                    return {...result, status: response.status};
                }
                return {error: true, message: 'Ошибка сервера', status: response.status};
            }

            return result;
        } catch {
            return {error: true, message: 'Ошибка соединения с сервером'};
        }
    }

    private static isAuthFailure(result: unknown): boolean {
        if (!this.isErrorResult(result)) {
            return false;
        }
        return result.status === 401 || /jwt expired|token expired|unauthorized|invalid token/i.test(result.message);
    }

    private static isErrorResult(result: unknown): result is ErrorResultResponse & {status?: number} {
        return Boolean(
            result &&
            typeof result === 'object' &&
            'error' in result &&
            (result as {error: unknown}).error === true
        );
    }
}
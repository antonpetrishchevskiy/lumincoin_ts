import {config} from "../../config/config";
import {LoginResponseBody, RefreshResponseBody} from "../../types/response-body.type";
import {ErrorResultResponse, LoginResultResponse, RefreshResultResponse} from "../../types/result-response.type";

type RefreshState = {
    promise: Promise<string | null> | null;
};

export class AuthTokens {
    static readonly accessTokenKey = 'accessToken';
    static readonly refreshTokenKey = 'refreshToken';
    static readonly userInfoTokenKey = 'userInfo';
    static readonly rememberMeKey = 'rememberMe';

    private static refreshState: RefreshState = {
        promise: null,
    };

    static setToken(tokenName: string, tokenValue: string, persistent = true): void {
        const storage = persistent ? localStorage : sessionStorage;
        storage.setItem(tokenName, tokenValue);
    }

    static getToken(tokenName: string): string | null {
        return localStorage.getItem(tokenName) ?? sessionStorage.getItem(tokenName);
    }

    static removeToken(tokenName: string): void {
        localStorage.removeItem(tokenName);
        sessionStorage.removeItem(tokenName);
    }

    static setSession(result: LoginResultResponse, rememberMe: boolean): void {
        this.clearSession();
        this.setToken(this.accessTokenKey, result.tokens.accessToken, rememberMe);
        this.setToken(this.refreshTokenKey, result.tokens.refreshToken, rememberMe);
        this.setToken(this.userInfoTokenKey, JSON.stringify(result.user), rememberMe);
        this.setToken(this.rememberMeKey, String(rememberMe), rememberMe);
    }

    static clearSession(): void {
        this.removeToken(this.accessTokenKey);
        this.removeToken(this.refreshTokenKey);
        this.removeToken(this.userInfoTokenKey);
        this.removeToken(this.rememberMeKey);
        this.removeToken('createBtn');
        this.removeToken('rowData');
        this.removeToken('idRowGenerals');
        this.removeToken('incomeElementTitle');
        this.removeToken('incomeElementId');
    }

    static hasRefreshToken(): boolean {
        return Boolean(this.getToken(this.refreshTokenKey));
    }

    static async login(email: string, password: string, rememberMe: boolean): Promise<LoginResultResponse | ErrorResultResponse> {
        const result = await this.request<LoginResultResponse | ErrorResultResponse>('/login', {
            email,
            password,
            rememberMe,
        } as LoginResponseBody);

        if (this.isLoginResult(result)) {
            this.setSession(result, rememberMe);
        }

        return result;
    }

    static async ensureAccessToken(forceRefresh = false): Promise<string | null> {
        const accessToken = this.getToken(this.accessTokenKey);
        const refreshToken = this.getToken(this.refreshTokenKey);

        if (!refreshToken) {
            return accessToken;
        }

        if (!forceRefresh && accessToken && !this.isTokenExpiring(accessToken)) {
            return accessToken;
        }

        const refreshedToken = await this.refreshToken();
        return refreshedToken ?? accessToken;
    }

    static async refreshToken(): Promise<string | null> {
        if (this.refreshState.promise) {
            return this.refreshState.promise;
        }

        const refreshToken = this.getToken(this.refreshTokenKey);
        if (!refreshToken) {
            return null;
        }

        this.refreshState.promise = this.performRefresh(refreshToken)
            .finally(() => {
                this.refreshState.promise = null;
            });

        return this.refreshState.promise;
    }

    private static async performRefresh(refreshToken: string): Promise<string | null> {
        const rememberMe = this.getToken(this.rememberMeKey) === 'true';

        let response: globalThis.Response;

        try {
            response = await fetch(config.api + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken,
                    rememberMe,
                } as RefreshResponseBody & { rememberMe: boolean }),
            });
        } catch (error) {
            console.error('Token refresh request failed:', error);
            return null;
        }

        let result: RefreshResultResponse | ErrorResultResponse;

        try {
            result = await response.json();
        } catch (error) {
            console.error('Invalid refresh response:', error);
            return null;
        }

        if (!response.ok || !this.isRefreshResult(result)) {
            if (response.status === 401 || response.status === 403 || this.isAuthError(result)) {
                this.clearSession();
            }
            return null;
        }

        const accessToken = result.tokens.accessToken;
        const nextRefreshToken = result.tokens.refreshToken;

        if (!accessToken || !nextRefreshToken) {
            this.clearSession();
            return null;
        }

        this.setToken(this.accessTokenKey, accessToken);
        this.setToken(this.refreshTokenKey, nextRefreshToken);

        return accessToken;
    }

    private static isTokenExpiring(token: string, thresholdSeconds = 60): boolean {
        const payload = this.decodeJwtPayload(token);
        if (!payload || typeof payload.exp !== 'number') {
            return false;
        }

        return payload.exp <= Math.floor(Date.now() / 1000) + thresholdSeconds;
    }

    private static decodeJwtPayload(token: string): { exp?: number } | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = decodeURIComponent(
                atob(normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '='))
                    .split('')
                    .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(payload);
        } catch {
            return null;
        }
    }

    private static async request<T>(endpoint: string, body: LoginResponseBody): Promise<T> {
        try {
            const response = await fetch(config.api + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            return await response.json() as T;
        } catch (error) {
            throw new Error('Ошибка соединения с сервером');
        }
    }

    private static isLoginResult(result: LoginResultResponse | ErrorResultResponse): result is LoginResultResponse {
        return 'tokens' in result && 'user' in result && Boolean(result.tokens?.accessToken && result.tokens?.refreshToken);
    }

    private static isRefreshResult(result: RefreshResultResponse | ErrorResultResponse): result is RefreshResultResponse {
        return 'tokens' in result && Boolean(result.tokens?.accessToken && result.tokens?.refreshToken);
    }

    private static isAuthError(result: RefreshResultResponse | ErrorResultResponse): boolean {
        return 'message' in result && /token|jwt|auth|unauthorized|invalid/i.test(result.message);
    }
}

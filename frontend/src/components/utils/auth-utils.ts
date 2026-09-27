import {Response} from "./response-utils";
import {LoginResponseBody, RefreshResponseBody} from "../../types/response-body.type";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {ErrorResultResponse, LoginResultResponse, RefreshResultResponse} from "../../types/result-response.type";

export class AuthTokens {
    private openNewRouteAutomatic: (url: string) => Promise<void>;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
    }

    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    public static setToken(tokenName: string, tokenValue: string) {
        localStorage.setItem(tokenName, tokenValue);
    }

    public static getToken(tokenName: string) {
        return localStorage.getItem(tokenName);
    }

    static async getTokensAfterRegistration(email: string, password: string, rememberMe: boolean = false) {

        const result: LoginResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('POST', '/login', null, {
            email: email,
            password: password,
            rememberMe: rememberMe,
        } as LoginResponseBody);

        console.log(result);

        if (result) {
            if (('error' in result) || !result.tokens || !result.user) {
                return result;
            }

            AuthTokens.setToken(AuthTokens.accessTokenKey, result.tokens.accessToken);
            AuthTokens.setToken(AuthTokens.refreshTokenKey, result.tokens.refreshToken);
            AuthTokens.setToken(AuthTokens.userInfoTokenKey, JSON.stringify(result.user));

            return result;
        }
    }

    static async refreshToken() {
        const refreshToken = AuthTokens.getToken(AuthTokens.refreshTokenKey);

        if (refreshToken) {
            const result: RefreshResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('POST', '/refresh', null, {refreshToken: refreshToken} as RefreshResponseBody);


            if (!result || 'error' in result || !result.tokens) {
                console.log('Refresh token устарел')
                localStorage.clear();
                return;
            }


            const access: string | null = result.tokens.accessToken;
            const refresh: string | null = result.tokens.refreshToken
            if (access && refresh) {
                AuthTokens.setToken(AuthTokens.accessTokenKey, access);
                AuthTokens.setToken(AuthTokens.refreshTokenKey, refresh);
            }
        }
    }
}
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

export class Response {
    public static async getElementsFromBackend(method: string, url: string, accessToken: string | null, body: ResponseBody | LoginResponseBody | RefreshResponseBody | EditCreateResponseBody | null = null, params: string | null = null): Promise<any> {
        let headers: ResponseUtilsObjectHeadersType | null = null;

        if (accessToken) {
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': accessToken,
            }
        } else {
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }

        let object: ResponseUtilsObjectType = {
            method: method,
            headers: headers,
        }

        if (body) {
            object.body = JSON.stringify(body);
        }

        if (params) {
            object.params = JSON.stringify(params);
        }

        const response: globalThis.Response = await fetch(config.api + url, object);

        if (!(response.status >= 200 && response.status < 300)) {
            console.log('Error fetching incomes from backend');
            localStorage.clear();
            return;
        }

        const result: EditCreateResponseBody[] | ErrorResultResponse = await response.json();

        if ('error' in result) {
            if(result.error) {
                if (result.message === "jwt expired") {
                    await AuthTokens.refreshToken();
                    await this.getElementsFromBackend(method, url, accessToken, body);
                    return;
                } else if (result.message === "Invalid email or password") {
                    return result;
                } else if (result.error) {
                    localStorage.clear();
                    return result;
                } else {
                    console.log(`Error: ${result.message}`);
                    localStorage.clear();
                }
            }
        }
        return result;
    }
}
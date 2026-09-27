import {EditCreateResponseBody, LoginResponseBody, RefreshResponseBody, ResponseBody} from "./response-body.type";

export type ResponseUtilsObjectType = {
    method: string,
    headers: ResponseUtilsObjectHeadersType,
    body?: string;
    params?: string;
}

export type ResponseUtilsObjectHeadersType = {
    "Accept": string,
    'Content-Type': string,
    'x-auth-token'?: string,
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ResponseUtilsObjectType = {
    method: HttpMethod;
    headers: ResponseUtilsObjectHeadersType;
    body?: string;
};

export type ResponseUtilsObjectHeadersType = {
    Accept: string;
    'Content-Type': string;
    'x-auth-token'?: string;
};
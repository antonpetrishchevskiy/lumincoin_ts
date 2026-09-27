export type ErrorResultResponse = {
    error: boolean;
    message: string;
    validation?: Array<{
        "key": string,
        "message": string;
    }>
}

export type SignUpResultResponse = {
    user: {
        "id": number,
        "email": string,
        "name": string,
        "lastName": string,
    }
}

export type LoginResultResponse = {
    tokens: {
        accessToken: string;
        "refreshToken": string;
    },
    user: {
        "name": string;
        "lastName": string;
        "id": number;
    }
}

export type AddCartResultResponse = {
    id: number;
    title: string;
}

export type GetCartTitle = Array<AddCartResultResponse>

export type EditCreateGeneralResultResponse = {
    id: number | null,
    type?: string | null,
    amount: number | null,
    date: string | null,
    comment: string | null,
    category?: string | null,
}

export type RefreshResultResponse = {
    tokens: {
        "accessToken": string| null;
        "refreshToken": string| null;

    }
}

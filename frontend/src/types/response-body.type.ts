export type ResponseBody = {
    title: string;
}

export type LoginResponseBody = {
    email: string;
    password: string;
    rememberMe: boolean;
}

export type RefreshResponseBody = {
    refreshToken: string;
}

export type EditCreateResponseBody = {
    type: string | null,
    amount: number | null,
    date: string | null,
    comment: string | null,
    category_id: number | null,
}


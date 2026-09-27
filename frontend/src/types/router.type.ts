export type RoutesType = {
    route: string;
    title: string;
    filePathTemplate: string;
    useLayout?: string;
    usePopup?: string;
    load?: () => void;
}

export type UserInfoType = {
    name: string;
    lastName: string;
    id: number;
}
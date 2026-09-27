import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {AddCartResultResponse, ErrorResultResponse} from "../../types/result-response.type";

export class AddCart {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly url: string;
    readonly urlRequest: string;
    readonly createBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;
    private inputCartValue: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.url = url;
        this.urlRequest = urlRequest;
        this.createBtn = document.getElementById("createCartBtn");
        this.cancelBtn = document.getElementById("cancelCreateCartBtn");
        this.inputCartValue = document.getElementById("nameCreateIncomeElement");
        if(this.createBtn) {
            this.createBtn.onclick = this.addCart.bind(this);
        }

        if(this.cancelBtn) {
            this.cancelBtn.onclick = () => {
                this.openNewRouteAutomatic(this.url).then();
            }
        }
    }

    private async addCart(): Promise<void> {
        const accessToken: string | null = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        const result: AddCartResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('POST', this.urlRequest, accessToken, {title: (this.inputCartValue as HTMLInputElement).value});

        if (('error' in result) || !('title' in result)) {
            console.log(`Error: ${result.message}`)
            return;
        }
        this.openNewRouteAutomatic(this.url).then();
    }
}
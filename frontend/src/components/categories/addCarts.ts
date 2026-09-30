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
    private inputCartValue: HTMLInputElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.url = url;
        this.urlRequest = urlRequest;
        this.createBtn = document.getElementById("createCartBtn");
        this.cancelBtn = document.getElementById("cancelCreateCartBtn");
        this.inputCartValue = document.getElementById("nameCreateIncomeElement") as HTMLInputElement | null;
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

        if (!this.inputCartValue) {
            return;
        }

        const title = this.inputCartValue.value.trim();
        if (!title) {
            this.inputCartValue.focus();
            return;
        }

        const result: AddCartResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('POST', this.urlRequest, accessToken, {title});

        if (('error' in result) || !('title' in result)) {
            console.log(`Error: ${result.message}`)
            return;
        }
        this.openNewRouteAutomatic(this.url).then();
    }
}
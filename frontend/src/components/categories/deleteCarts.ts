import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class DeleteCart {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType
    readonly urlRequest: string;
    readonly url: string;
    private incomeElementId: string | null;
    readonly deleteBtnGreen: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.incomeElementId = null;
        this.deleteBtnGreen = document.getElementById('deleteBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        if(this.deleteBtnGreen) {
            this.deleteBtnGreen.onclick = this.deleteElement.bind(this);
        }
        if(this.cancelBtn) {
            this.cancelBtn.onclick = this.cancelDelete.bind(this);
        }
    }

    private async deleteElement(): Promise<void> {
        this.incomeElementId = localStorage.getItem('incomeElementId');
        const accessToken: string | null = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        const result = await Response.getElementsFromBackend('DELETE', this.urlRequest + this.incomeElementId, accessToken);

        if (result.error) {
            console.log(`Error: ${result.message}`)
            return;
        }
        this.openNewRouteAutomatic(this.url).then();
    }

    private cancelDelete(): void {
        this.openNewRouteAutomatic(this.url).then();
    }
}
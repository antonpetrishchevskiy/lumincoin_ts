import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class DeleteCart {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType
    readonly urlRequest: string;
    readonly url: string;
    private incomeElementId: string | null;
    readonly deleteBtnGreen: HTMLButtonElement | null;
    readonly cancelBtn: HTMLButtonElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.incomeElementId = new URLSearchParams(window.location.search).get('id');
        this.deleteBtnGreen = document.getElementById('deleteBtn') as HTMLButtonElement | null;
        this.cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null;
        if(this.deleteBtnGreen) {
            this.deleteBtnGreen.onclick = this.deleteElement.bind(this);
        }
        if(this.cancelBtn) {
            this.cancelBtn.onclick = this.cancelDelete.bind(this);
        }
    }

    private async deleteElement(): Promise<void> {
        const accessToken = await AuthTokens.ensureAccessToken();
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        if (!this.incomeElementId) {
            await this.openNewRouteAutomatic(this.url);
            return;
        }

        const result = await Response.getElementsFromBackend('DELETE', this.urlRequest + this.incomeElementId, accessToken);

        if (!('error' in result) || !result.error) {
            await this.openNewRouteAutomatic(this.url);
        }
    }

    private async cancelDelete(): Promise<void> {
        await this.openNewRouteAutomatic(this.url);
    }
}
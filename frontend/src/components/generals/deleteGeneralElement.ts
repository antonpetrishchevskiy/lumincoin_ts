import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class DeleteGeneralElement {
    private openNewRouteAutomatic: OpenNewRouteAutomaticType
    readonly urlRequest: string;
    readonly url: string;
    private generalElementId: string | null;
    readonly deleteBtn: HTMLButtonElement | null;
    readonly cancelBtn: HTMLButtonElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.generalElementId = new URLSearchParams(window.location.search).get('id');
        this.deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement | null;
        this.cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null;
        if(this.deleteBtn) {
            this.deleteBtn.onclick = this.deleteElement.bind(this);
        }
        if(this.cancelBtn) {
            this.cancelBtn.onclick = this.cancelDelete.bind(this);
        }
    }

    private async deleteElement(): Promise<void> {
        const accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        if (!this.generalElementId) {
            await this.openNewRouteAutomatic(this.url);
            return;
        }

        const result = await Response.getElementsFromBackend('DELETE', this.urlRequest + this.generalElementId, accessToken);
        if (!('error' in result) || !result.error) {
            await this.openNewRouteAutomatic(this.url);
        }
    }

    private async cancelDelete(): Promise<void> {
        await this.openNewRouteAutomatic(this.url);
    }
}
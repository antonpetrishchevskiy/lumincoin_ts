import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {ErrorResultResponse} from "../../types/result-response.type";

export class DeleteGeneralElement {
    private openNewRouteAutomatic: OpenNewRouteAutomaticType
    readonly urlRequest: string;
    readonly url: string;
    private generalElementId: string | null;
    readonly deleteBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.generalElementId = null;
        this.deleteBtn = document.getElementById('deleteBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        if(this.deleteBtn) {
            this.deleteBtn.onclick = this.deleteElement.bind(this);
        }
        if(this.cancelBtn) {
            this.cancelBtn.onclick = this.cancelDelete.bind(this);
        }
    }

    private async deleteElement(): Promise<void> {
        this.generalElementId = localStorage.getItem('idRowGenerals');
        const accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        const result: ErrorResultResponse = await Response.getElementsFromBackend('DELETE', this.urlRequest + this.generalElementId, accessToken);
        if (result.error) {
            console.log(`Error: ${result.message}`)
            return;
        }
        this.openNewRouteAutomatic(this.url).then();
    }

    cancelDelete() {
        this.openNewRouteAutomatic(this.url).then();
    }
}
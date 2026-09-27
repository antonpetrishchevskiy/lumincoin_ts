import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class EditCarts {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly urlRequest: string;
    readonly url: string;
    readonly incomeElementTitle: string | null;
    readonly incomeElementId: string | null;
    readonly editElementTitle: HTMLElement | null;
    readonly saveBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.incomeElementTitle = localStorage.getItem('incomeElementTitle');
        this.incomeElementId = localStorage.getItem('incomeElementId');
        this.editElementTitle = document.getElementById('nameEditElement');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelEdit');
        this.setEditElementValue();
        if (this.saveBtn) {
            this.saveBtn.onclick = this.changeElementValue.bind(this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.onclick = this.cancelEditElement.bind(this);
        }
    }

    private setEditElementValue(): void {
        if (this.editElementTitle && this.incomeElementTitle) {
            (this.editElementTitle as HTMLInputElement).value = this.incomeElementTitle;
        }
    }

    private async changeElementValue(): Promise<void> {
        const accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (this.editElementTitle) {
            const editElementTitle = (this.editElementTitle as HTMLInputElement).value;
            if (!accessToken) {
                console.log('No access token');
                return;
            }

            const result = await Response.getElementsFromBackend('PUT', this.urlRequest + this.incomeElementId, accessToken, {title: editElementTitle});

            if (result) {
                this.openNewRouteAutomatic(this.url).then();
            }
        }
    }

    cancelEditElement() {
        this.openNewRouteAutomatic(this.url).then();
    }
}
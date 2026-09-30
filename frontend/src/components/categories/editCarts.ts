import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class EditCarts {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly urlRequest: string;
    readonly url: string;
    readonly incomeElementTitle: string | null;
    readonly incomeElementId: string | null;
    readonly editElementTitle: HTMLInputElement | null;
    readonly saveBtn: HTMLButtonElement | null;
    readonly cancelBtn: HTMLButtonElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        const params = new URLSearchParams(window.location.search);
        this.incomeElementId = params.get('id');
        this.incomeElementTitle = params.get('title');
        this.editElementTitle = document.getElementById('nameEditElement') as HTMLInputElement | null;
        this.saveBtn = document.getElementById('saveBtn') as HTMLButtonElement | null;
        this.cancelBtn = document.getElementById('cancelEdit') as HTMLButtonElement | null;
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
        const accessToken = await AuthTokens.ensureAccessToken();
        if (this.editElementTitle) {
            const editElementTitle = this.editElementTitle.value.trim();
            if (!this.incomeElementId || !accessToken || !editElementTitle) {
                console.log('No access token');
                return;
            }

            const result = await Response.getElementsFromBackend('PUT', this.urlRequest + this.incomeElementId, accessToken, {title: editElementTitle});

            if (!('error' in result) || !result.error) {
                await this.openNewRouteAutomatic(this.url);
            }
        }
    }

    private async cancelEditElement(): Promise<void> {
        await this.openNewRouteAutomatic(this.url);
    }
}
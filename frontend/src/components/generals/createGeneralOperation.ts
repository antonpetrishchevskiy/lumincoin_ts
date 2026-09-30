import {Response} from "../utils/response-utils";
import {AuthTokens} from "../utils/auth-utils";
import {url} from "../../config/config";
import {Validation} from "../utils/validation";
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {EditCreateResponseBody} from "../../types/response-body.type";
import {EditCreateGeneralResultResponse, ErrorResultResponse, GetCartTitle} from "../../types/result-response.type";

export class CreateGeneralOperation {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly urlRequest: string;
    readonly url: string;
    readonly amountElement: HTMLInputElement | null;
    readonly dataElement: HTMLInputElement | null;
    readonly commentElement: HTMLInputElement | null;
    readonly btnCreate: HTMLButtonElement | null;
    readonly btnCancel: HTMLButtonElement | null;
    private accessToken: string | null;
    readonly type: string | null;
    readonly selects: NodeListOf<HTMLSelectElement>;
    private element: GetCartTitle = [];

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.amountElement = document.getElementById('sumCreateGeneralElement') as HTMLInputElement | null;
        this.dataElement = document.getElementById('dataCreateGeneralElement') as HTMLInputElement | null;
        this.commentElement = document.getElementById('commentCreateGeneralElement') as HTMLInputElement | null;
        this.btnCreate = document.getElementById('btn-create') as HTMLButtonElement | null;
        this.btnCancel = document.getElementById('btn-cancel') as HTMLButtonElement | null;
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        this.type = new URLSearchParams(window.location.search).get('type');
        this.selects = document.querySelectorAll('select');

        this.selectColorText();
        this.automaticChoiceType();

        this.btnCancel?.addEventListener('click', () => {
            this.clickBtnCancel().catch(console.error);
        });
        this.btnCreate?.addEventListener('click', () => {
            this.clickBtnCreate().catch(console.error);
        });

        flatpickr('#dataCreateGeneralElement', {
            dateFormat: 'Y-m-d',
            locale: Russian,
        });
    }

    private selectColorText(): void {
        if (this.selects.length < 2) {
            return;
        }

        this.selects[1].style.color = '#6c757d';
        this.selects[0].addEventListener('focus', () => {
            this.selects[0].style.color = 'black';
        });
        this.selects[1].addEventListener('focus', () => {
            this.selects[1].style.color = 'black';
        });
        this.selects[1].addEventListener('blur', () => {
            if (!this.selects[1].value) {
                this.selects[1].style.color = '#6c757d';
            }
        });
    }

    private automaticChoiceType(): void {
        if (this.selects.length < 2 || !this.type) {
            return;
        }

        this.selects[0].value = this.type;
        this.selects[0].disabled = true;
        this.addSelectCategoryValue().catch(console.error);
    }

    private async addSelectCategoryValue(): Promise<void> {
        if (this.selects.length < 2) {
            return;
        }

        this.accessToken = await AuthTokens.ensureAccessToken();
        const urlRequest = this.selects[0].value === 'income'
            ? url.changeIncomes
            : url.changeExpenses;

        const result = await Response.getElementsFromBackend<GetCartTitle>(
            'GET',
            urlRequest,
            this.accessToken
        );

        if (Array.isArray(result)) {
            this.element = result;
        }

        this.createSelectOptionsCategory();
    }

    private createSelectOptionsCategory(): void {
        if (this.selects.length < 2) {
            return;
        }

        this.selects[1].querySelectorAll('option:not(:first-child)').forEach(option => option.remove());

        this.element.forEach(category => {
            const option = document.createElement('option');
            option.value = category.title;
            option.id = String(category.id);
            option.textContent = category.title;
            this.selects[1].appendChild(option);
        });
    }

    private async clickBtnCreate(): Promise<void> {
        if (!Validation.validationGenerals(
            this.selects,
            this.amountElement,
            this.dataElement,
            this.commentElement
        )) {
            return;
        }

        const selectedCategory = this.selects[1]?.selectedOptions[0];
        const body: EditCreateResponseBody = {
            type: this.selects[0]?.value ?? null,
            amount: this.amountElement ? Number(this.amountElement.value) : null,
            date: this.dataElement?.value ?? null,
            comment: this.commentElement?.value.trim() ?? null,
            category_id: selectedCategory?.id ? Number(selectedCategory.id) : null,
        };

        const result: EditCreateGeneralResultResponse | ErrorResultResponse =
            await Response.getElementsFromBackend('POST', this.urlRequest, this.accessToken, body);

        if (!('error' in result) || !result.error) {
            await this.openNewRouteAutomatic(this.url);
        }
    }

    private async clickBtnCancel(): Promise<void> {
        await this.openNewRouteAutomatic(this.url);
    }
}

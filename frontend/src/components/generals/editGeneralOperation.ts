import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {Validation} from "../utils/validation";
import {url} from "../../config/config";
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {RowDataGeneralType} from "../../types/general.type";
import {EditCreateResponseBody} from "../../types/response-body.type";
import {EditCreateGeneralResultResponse, ErrorResultResponse, GetCartTitle} from "../../types/result-response.type";

export class EditGeneralOperation {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly urlRequest: string;
    readonly url: string;
    private readonly generalElementId: string | null;
    readonly selects: NodeListOf<HTMLSelectElement>;
    readonly editTypeElement: HTMLSelectElement | null;
    readonly editCategoryElement: HTMLSelectElement | null;
    readonly editAmountElement: HTMLInputElement | null;
    readonly editDateElement: HTMLInputElement | null;
    readonly editCommentElement: HTMLInputElement | null;
    readonly saveBtn: HTMLButtonElement | null;
    readonly cancelBtn: HTMLButtonElement | null;
    readonly editErrorElement: HTMLElement | null;
    private rowData: RowDataGeneralType;
    private accessToken: string | null;
    private element: GetCartTitle = [];

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;

        const params = new URLSearchParams(window.location.search);
        this.generalElementId = params.get('id');
        const storedOperation = this.generalElementId
            ? sessionStorage.getItem(`general-operation-edit-${this.generalElementId}`)
            : null;

        this.rowData = storedOperation
            ? JSON.parse(storedOperation) as RowDataGeneralType
            : {
                type: null,
                category: null,
                amount: null,
                date: null,
                comment: null,
            };

        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        this.selects = document.querySelectorAll('select');
        this.editTypeElement = this.selects[0] ?? null;
        this.editCategoryElement = this.selects[1] ?? null;
        this.editAmountElement = document.getElementById('sumEditGeneralElement') as HTMLInputElement | null;
        this.editDateElement = document.getElementById('dataEditGeneralElement') as HTMLInputElement | null;
        this.editCommentElement = document.getElementById('commentEditGeneralElement') as HTMLInputElement | null;
        this.saveBtn = document.getElementById('saveBtn') as HTMLButtonElement | null;
        this.cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null;
        this.editErrorElement = document.getElementById('editGeneralError');

        this.editElement();

        this.saveBtn?.addEventListener('click', () => {
            this.clickBtnEdit().catch(console.error);
        });
        this.cancelBtn?.addEventListener('click', () => {
            this.clickBtnCancel().catch(console.error);
        });

        flatpickr('#dataEditGeneralElement', {
            dateFormat: 'Y-m-d',
            locale: Russian,
        });
    }

    private editElement(): void {
        if (!this.generalElementId || !this.rowData.type) {
            this.showError('Не удалось загрузить данные операции. Вернитесь к списку и откройте редактирование ещё раз.');
            if (this.saveBtn) {
                this.saveBtn.disabled = true;
            }
            return;
        }

        if (this.editTypeElement) {
            this.editTypeElement.value = this.rowData.type;
            this.editTypeElement.disabled = true;
        }

        this.addSelectCategoryValue().catch(console.error);

        if (this.editAmountElement && this.rowData.amount !== null) {
            this.editAmountElement.value = this.rowData.amount;
        }
        if (this.editDateElement && this.rowData.date !== null) {
            this.editDateElement.value = this.rowData.date;
        }
        if (this.editCommentElement && this.rowData.comment !== null) {
            this.editCommentElement.value = this.rowData.comment;
        }

        this.editTypeElement?.addEventListener('change', () => {
            this.addSelectCategoryValue().catch(console.error);
        });
    }

    private async addSelectCategoryValue(): Promise<void> {
        if (!this.editTypeElement || !this.editCategoryElement) {
            return;
        }

        this.accessToken = await AuthTokens.ensureAccessToken();
        const requestUrl = this.editTypeElement.value === 'income'
            ? url.changeIncomes
            : url.changeExpenses;

        const result = await Response.getElementsFromBackend<GetCartTitle>(
            'GET',
            requestUrl,
            this.accessToken
        );

        if (Array.isArray(result)) {
            this.element = result;
        }

        this.createSelectOptionsCategory();
    }

    private createSelectOptionsCategory(): void {
        if (!this.editCategoryElement) {
            return;
        }

        this.editCategoryElement.querySelectorAll('option:not(:first-child)').forEach(option => option.remove());

        this.element.forEach(category => {
            const option = document.createElement('option');
            option.value = String(category.id);
            option.textContent = category.title;
            this.editCategoryElement?.appendChild(option);
        });

        if (this.rowData.category === 'без категории' || !this.rowData.category) {
            this.editCategoryElement.value = '';
        } else {
            const category = this.element.find(item => item.title === this.rowData.category);
            if (category) {
                this.editCategoryElement.value = String(category.id);
            }
        }
    }

    private async clickBtnEdit(): Promise<void> {
        if (!this.generalElementId || !Validation.validationGenerals(
            this.selects,
            this.editAmountElement,
            this.editDateElement,
            this.editCommentElement
        )) {
            return;
        }

        this.showError('');

        const selectedCategory = this.editCategoryElement?.selectedOptions[0];
        const body: EditCreateResponseBody = {
            type: this.editTypeElement?.value ?? null,
            amount: this.editAmountElement ? Number(this.editAmountElement.value) : null,
            date: this.editDateElement?.value ?? null,
            comment: this.editCommentElement?.value.trim() ?? null,
            category_id: selectedCategory?.id ? Number(selectedCategory.id) : null,
        };

        const result: EditCreateGeneralResultResponse | ErrorResultResponse =
            await Response.getElementsFromBackend('PUT', this.urlRequest + this.generalElementId, this.accessToken, body);

        if (!('error' in result) || !result.error) {
            sessionStorage.removeItem(`general-operation-edit-${this.generalElementId}`);
            await this.openNewRouteAutomatic(this.url);
            return;
        }

        this.showError(result.message || 'Не удалось сохранить операцию. Попробуйте ещё раз.');
    }

    private showError(message: string): void {
        if (!this.editErrorElement) {
            return;
        }

        this.editErrorElement.textContent = message;
        this.editErrorElement.classList.toggle('d-none', !message);
    }

    private async clickBtnCancel(): Promise<void> {
        if (this.generalElementId) {
            sessionStorage.removeItem(`general-operation-edit-${this.generalElementId}`);
        }
        await this.openNewRouteAutomatic(this.url);
    }
}

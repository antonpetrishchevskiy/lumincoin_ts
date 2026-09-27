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
    private generalElementId: string | null;
    readonly selects: NodeListOf<HTMLElement> | null;
    readonly editTypeElement: HTMLElement | null;
    private editCategoryElement: HTMLElement | null;
    readonly editAmountElement: HTMLInputElement | null;
    readonly editDateElement: HTMLInputElement | null;
    readonly editCommentElement: HTMLInputElement | null;
    readonly saveBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;
    private rowData: RowDataGeneralType | null;
    private accessToken: string | null;
    private element: GetCartTitle | [];

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.generalElementId = null;
        this.accessToken = null;
        this.rowData = null;
        this.element = [];
        this.selects = document.querySelectorAll('select');
        this.editTypeElement = this.selects[0];
        this.editCategoryElement = this.selects[1];
        this.editAmountElement = document.getElementById('sumEditGeneralElement') as HTMLInputElement | null;
        this.editDateElement = document.getElementById('dataEditGeneralElement') as HTMLInputElement | null;
        this.editCommentElement = document.getElementById('commentEditGeneralElement') as HTMLInputElement | null;
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        if (this.saveBtn) {
            this.saveBtn.onclick = this.clickBtnEdit.bind(this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.onclick = this.clickBtnCancel.bind(this);
        }
        this.editElement();

        flatpickr("#dataEditGeneralElement", {
            dateFormat: "Y-m-d",
            locale: Russian,
        });
    }

    private editElement(): void {
        const rowDataString: string | null = AuthTokens.getToken('rowData')
        if (rowDataString) {
            this.rowData = JSON.parse(rowDataString);
        }
        if (this.editTypeElement) {
            Array.from((this.editTypeElement as HTMLSelectElement).options).forEach((item) => {

                if (this.rowData && item.textContent === this.rowData.type) {
                    item.setAttribute('selected', 'selected');
                } else {
                    item.removeAttribute('selected');
                }
                if (this.editTypeElement) {
                    this.editTypeElement.setAttribute('disabled', 'disabled');
                }
            })
        }

        this.addSelectCategoryValue().then();

        if (this.rowData) {
            if (this.editAmountElement && this.rowData.amount) {
                this.editAmountElement.value = this.rowData.amount;
            }
            if (this.editDateElement && this.rowData.date) {
                this.editDateElement.value = this.rowData.date;
            }

            if (this.editCommentElement && this.rowData.comment) {
                this.editCommentElement.value = this.rowData.comment;
            }
        }

        if (this.selects) {
            this.selects[0].addEventListener('change', (e) => {
                this.addSelectCategoryValue().then();
            })
        }
    }

    private async addSelectCategoryValue(): Promise<void> {
        let urlRequest = null;
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (this.selects && (this.selects[0] as HTMLInputElement).value === 'income') {
            urlRequest = url.changeIncomes;
        } else {
            urlRequest = url.changeExpenses;
        }
        this.element = await Response.getElementsFromBackend('GET', urlRequest, this.accessToken);
        this.createSelectOptionsCategory();
    }

    private createSelectOptionsCategory(): void {
        if (this.selects) {
            this.selects[1].querySelectorAll('option').forEach(option => {
                if (option.value !== '') {
                    option.remove();
                }
            })

            for (let i = 0; i < this.element.length; i++) {
                const option = document.createElement('option');
                option.value = this.element[i].title;
                option.id = this.element[i].id.toString();
                option.innerText = this.element[i].title;
                this.selects[1].appendChild(option);
            }

            if (this.rowData && this.rowData.category === 'без категории') {
                const option = document.createElement('option');
                option.value = '';
                option.innerText = 'без категории';
                option.setAttribute('selected', 'selected');
                this.selects[1].appendChild(option);
            } else {
                Array.from((this.editCategoryElement as HTMLSelectElement).options).forEach((item) => {
                    if (this.rowData && item.textContent === this.rowData.category) {
                        item.setAttribute('selected', 'selected');
                    } else {
                        item.removeAttribute('selected');
                    }
                })
            }
        }
    }

    private async clickBtnEdit(): Promise<void> {
        this.generalElementId = localStorage.getItem('idRowGenerals')
        if (Validation.validationGenerals(this.selects, this.editAmountElement, this.editDateElement, this.editCommentElement)) {
            const body: EditCreateResponseBody = {
                type: null,
                amount: null,
                date: null,
                comment: null,
                category_id: null,
            }

            if (this.selects) {
                body.type = (this.selects[0] as HTMLSelectElement).value;
            }
            if (this.editAmountElement) {
                body.amount = +this.editAmountElement.value;
            }
            if (this.editDateElement) {
                body.date = this.editDateElement.value;
            }
            if (this.editCommentElement) {
                body.comment = this.editCommentElement.value;
            }
            if (this.selects) {
                body.category_id = Number((this.selects[1] as HTMLSelectElement).options[(this.selects[1] as HTMLSelectElement).selectedIndex].id);
            }


            const result: EditCreateGeneralResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('PUT', this.urlRequest + this.generalElementId, this.accessToken, (body as EditCreateResponseBody));

            if (result) {
                this.openNewRouteAutomatic(this.url).then();
            }
        }
    }

    clickBtnCancel() {
        this.openNewRouteAutomatic(this.url).then();
    }
}
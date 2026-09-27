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
    readonly amountElement: HTMLElement | null;
    readonly dataElement: HTMLElement | null;
    readonly commentElement: HTMLElement | null;
    readonly btnCreate: HTMLElement | null;
    readonly btnCancel: HTMLElement | null;
    private accessToken: string | null;
    readonly type: string | null;
    readonly selects: NodeListOf<HTMLElement> | null;
    private element: GetCartTitle | [];

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType, urlRequest: string, url: string) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.urlRequest = urlRequest;
        this.url = url;
        this.amountElement = document.getElementById('sumCreateGeneralElement');
        this.dataElement = document.getElementById('dataCreateGeneralElement');
        this.commentElement = document.getElementById('commentCreateGeneralElement');
        this.btnCreate = document.getElementById("btn-create");
        this.btnCancel = document.getElementById("btn-cancel");
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        this.type = AuthTokens.getToken('createBtn');
        this.selects = document.querySelectorAll('select');
        this.element = [];
        this.selectColorText();
        this.automaticChoiceType();
        if (this.btnCancel) {
            this.btnCancel.onclick = this.clickBtnCancel.bind(this);
        }
        if (this.btnCreate) {
            this.btnCreate.onclick = this.clickBtnCreate.bind(this);
        }

        flatpickr("#dataCreateGeneralElement", {
            dateFormat: "Y-m-d",
            locale: Russian,
        });
    }

    private selectColorText(): void {
        if (this.selects) {
            this.selects[1].style.color = '#6c757d';
            this.selects[0].addEventListener('focus', (e) => {
                if (this.selects) {
                    this.selects[0].style.color = 'black';
                }
            })
            this.selects[1].addEventListener('focus', (e) => {
                if (this.selects) {
                    this.selects[1].style.color = 'black';
                }
            })
            this.selects[1].addEventListener('blur', (e) => {
                if (this.selects) {
                    if ((this.selects[1] as HTMLSelectElement).value === '') {
                        this.selects[1].style.color = '#6c757d';
                    }
                }
            })
        }
    }

    private automaticChoiceType(): void {
        if (this.selects) {
            this.selects[0].querySelectorAll('option').forEach(option => {
                if (option.value === this.type) {
                    option.selected = true;
                }
                if (this.selects) {
                    this.selects[0].setAttribute('disabled', 'disabled');
                }
            });
        }
        this.addSelectCategoryValue().then();
    }

    private async addSelectCategoryValue(): Promise<void> {
        let urlRequest: string = '';
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (this.selects) {
            if ((this.selects[0] as HTMLOptionElement).value === 'income') {
                urlRequest = url.changeIncomes;
            } else {
                urlRequest = url.changeExpenses;
            }
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
                const option: HTMLOptionElement = document.createElement('option');
                option.value = this.element[i].title;
                option.id = this.element[i].id.toString();
                option.innerText = this.element[i].title;
                this.selects[1].appendChild(option);
            }
        }
    }

    private async clickBtnCreate(): Promise<void> {
        if (Validation.validationGenerals(this.selects, this.amountElement, this.dataElement, this.commentElement)) {
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
            if (this.amountElement) {
                body.amount = +(this.amountElement as HTMLInputElement).value;
            }
            if (this.dataElement) {
                body.date = (this.dataElement as HTMLInputElement).value;
            }
            if (this.commentElement) {
                body.comment = (this.commentElement as HTMLInputElement).value;
            }
            if (this.selects) {
                body.category_id = Number((this.selects[1] as HTMLSelectElement).options[(this.selects[1] as HTMLSelectElement).selectedIndex].id);
            }

            const result: EditCreateGeneralResultResponse | ErrorResultResponse = await Response.getElementsFromBackend('POST', this.urlRequest, this.accessToken, body);
            if (result) {
                this.openNewRouteAutomatic(this.url).then();
            }
        }
    }

    private clickBtnCancel(): void {
        this.openNewRouteAutomatic(this.url).then();
    }
}
import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {ErrorResultResponse, GetCartTitle} from "../../types/result-response.type";

export class CreateCart {
    readonly url: string;
    readonly pathEdit: string;
    readonly pathDelete: string;
    readonly pathCreate: string;
    private container: HTMLElement | null;
    private element: GetCartTitle| ErrorResultResponse | null;
    readonly accessToken: string | null;
    private btnEdits: NodeListOf<HTMLElement> | null;

    constructor(url: string, pathEdit: string, pathDelete: string, pathCreate: string, container: HTMLElement | null) {
        this.url = url;
        this.element = null;
        this.pathEdit = pathEdit;
        this.pathDelete = pathDelete;
        this.pathCreate = pathCreate;
        this.container = container;
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        this.btnEdits = null;
        this.init().then();
    }

    private async init(): Promise<void> {
        this.element = await Response.getElementsFromBackend('GET', this.url, this.accessToken);
        this.createCarts();
        this.getIncomeElementValue();
    }

    private createCarts(): void {
        if (this.container === null) {
            this.container = document.querySelector('.income-elements');
        }
        if (this.element && !('error' in this.element)) {
            for (let i = 0; i < this.element.length; i++) {
                const incomeElement: HTMLElement | null = document.createElement('div');
                incomeElement.classList.add('income-element', 'd-flex', 'flex-column', 'justify-content-center');

                const titleDiv: HTMLElement | null = document.createElement('div');
                titleDiv.classList.add('income-element-title', 'ps-3');
                titleDiv.textContent = this.element[i].title;
                titleDiv.setAttribute('id', this.element[i].id.toString());

                const buttonsDiv: HTMLElement | null = document.createElement('div');
                buttonsDiv.classList.add('income-element-buttons', 'ps-3', 'mt-3');

                const editButton: HTMLElement | null = document.createElement('a');
                (editButton as HTMLAnchorElement).href = this.pathEdit;
                editButton.classList.add('btn', 'btn-edit', 'btn-primary', 'me-3');
                editButton.textContent = 'Редактировать';

                const deleteButton: HTMLElement | null = document.createElement('a');
                (deleteButton as HTMLAnchorElement).href = this.pathDelete;
                deleteButton.classList.add('btn', 'btn-danger', 'deleteBtnRed');
                deleteButton.textContent = 'Удалить';

                buttonsDiv.appendChild(editButton);
                buttonsDiv.appendChild(deleteButton);

                incomeElement.appendChild(titleDiv);
                incomeElement.appendChild(buttonsDiv);
                if (this.container) {
                    this.container.appendChild(incomeElement);
                }
            }
        }

        const addButton: HTMLElement | null = document.createElement('a');
        (addButton as HTMLAnchorElement).href = this.pathCreate;
        addButton.classList.add('income-element', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'text-decoration-none');

        const icon: HTMLElement | null = document.createElement('i');
        icon.classList.add('fas', 'fa-plus', 'text-secondary');

        addButton.appendChild(icon);
        if (this.container) {
            this.container.appendChild(addButton);
        }
    }

    private getIncomeElementValue(): void {
        this.btnEdits = document.querySelectorAll('.btn-edit');
        if (this.btnEdits) {
            this.btnEdits.forEach((btnEdit) => {
                btnEdit.onclick = function () {
                    const incomeElement = btnEdit.closest('.income-element-buttons') as HTMLElement | null;
                    if (incomeElement) {
                        const incomeElementTitle = incomeElement.previousElementSibling;
                        if (incomeElementTitle) {
                            const incomeElementId = incomeElementTitle.getAttribute('id');
                            localStorage.setItem('incomeElementTitle', (incomeElementTitle as HTMLElement).innerText);
                            if (incomeElementId) {
                                localStorage.setItem('incomeElementId', incomeElementId);
                            }
                        }
                    }
                }
            })
        }

        const deleteBtnsRed: NodeListOf<HTMLElement> | null = document.querySelectorAll('.deleteBtnRed');
        if (deleteBtnsRed) {
            deleteBtnsRed.forEach((deleteBtnRed: HTMLElement) => {
                deleteBtnRed.onclick = function () {
                    const incomeElementButton: HTMLElement | null = deleteBtnRed.closest('.income-element-buttons');
                    if (incomeElementButton) {
                        const incomeElement = incomeElementButton.previousElementSibling as HTMLElement | null;
                        if (incomeElement) {
                            const incomeElementId: string | null = incomeElement.getAttribute('id');
                            if (incomeElementId) {
                                localStorage.setItem('incomeElementId', incomeElementId);
                            }
                        }
                    }
                }
            })
        }
    }
}
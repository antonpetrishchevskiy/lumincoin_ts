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

    constructor(url: string, pathEdit: string, pathDelete: string, pathCreate: string, container: HTMLElement | null) {
        this.url = url;
        this.element = null;
        this.pathEdit = pathEdit;
        this.pathDelete = pathDelete;
        this.pathCreate = pathCreate;
        this.container = container;
        this.accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        this.init().catch(console.error);
    }

    private async init(): Promise<void> {
        this.element = await Response.getElementsFromBackend<GetCartTitle | ErrorResultResponse>('GET', this.url, this.accessToken);
        this.createCarts();
    }

    private createCarts(): void {
        let container = this.container;

        if (!container) {
            container = document.querySelector('.income-elements');
        }

        if (!container) {
            return;
        }

        if (this.element && !('error' in this.element)) {
            this.element.forEach((category) => {
                const incomeElement = document.createElement('div');
                incomeElement.classList.add('income-element', 'd-flex', 'flex-column', 'justify-content-center');

                const titleDiv = document.createElement('div');
                titleDiv.classList.add('income-element-title', 'ps-3');
                titleDiv.textContent = category.title;

                const buttonsDiv = document.createElement('div');
                buttonsDiv.classList.add('income-element-buttons', 'ps-3', 'mt-3');

                const editButton = document.createElement('a');
                editButton.href = this.buildItemUrl(this.pathEdit, category.id, {title: category.title});
                editButton.classList.add('btn', 'btn-primary', 'me-3');
                editButton.textContent = 'Редактировать';

                const deleteButton = document.createElement('a');
                deleteButton.href = this.buildItemUrl(this.pathDelete, category.id);
                deleteButton.classList.add('btn', 'btn-danger');
                deleteButton.textContent = 'Удалить';

                buttonsDiv.append(editButton, deleteButton);
                incomeElement.append(titleDiv, buttonsDiv);
                container.appendChild(incomeElement);
            });
        }

        const addButton = document.createElement('a');
        addButton.href = this.pathCreate;
        addButton.classList.add('income-element', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'text-decoration-none');
        addButton.setAttribute('aria-label', 'Создать категорию');

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-plus', 'text-secondary');
        icon.setAttribute('aria-hidden', 'true');

        addButton.appendChild(icon);
        container.appendChild(addButton);
    }

    private buildItemUrl(path: string, id: number, params: Record<string, string> = {}): string {
        const searchParams = new URLSearchParams({id: String(id), ...params});
        return path + '?' + searchParams.toString();
    }

}

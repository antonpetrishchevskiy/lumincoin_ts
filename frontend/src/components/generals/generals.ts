import {AuthTokens} from "../utils/auth-utils";
import {Response} from "../utils/response-utils";
import {url} from "../../config/config";
import {Period} from "../utils/period";
import {GetDataUtils} from "../utils/getData-utils";
import {main} from "../main";
import {RowDataGeneralType} from "../../types/general.type";
import {EditCreateGeneralResultResponse, ErrorResultResponse} from "../../types/result-response.type";

export class Generals {
    private btnsCreate: NodeListOf<HTMLElement> | null;
    readonly todayData: string | null;
    readonly period: string | null;
    private result: EditCreateGeneralResultResponse[] | ErrorResultResponse | null;
    readonly wrapperTable: HTMLElement | null;
    private editBtns: NodeListOf<HTMLElement> | null;
    private deleteBtns: NodeListOf<HTMLElement> | null;

    constructor(period: string | null = null) {
        this.btnsCreate = document.querySelectorAll('.btn-create');
        this.btnsCreate.forEach(btn => {
            btn.onclick = function (event: Event) {
                const eventTarget = event.target as HTMLElement | null;
                if (eventTarget) {
                    const AttributeTypeValue: string | null = eventTarget.getAttribute('type');
                    if (AttributeTypeValue) {
                        AuthTokens.setToken('createBtn', AttributeTypeValue);
                    }
                }

            };
        })
        this.todayData = GetDataUtils.getData();
        this.period = period ? period : `?period=${this.todayData}`;
        this.result = null;
        this.wrapperTable = document.getElementById("wrapperGeneralTable");
        this.init().then();
        this.editBtns = null;
        this.deleteBtns = null;
        new Period();
        if (location.pathname === '/') {
            window.onresize = this.resize.bind(this);
        }
    }

    async init() {
        await this.getGeneralsOperationsFromBackend().then();
        if (location.pathname === "/generals") {
            this.createTableWithOperations();
            this.editBtns = document.querySelectorAll('.editGeneralOperation')
            this.editBtns.forEach(editBtn => {
                editBtn.onclick = this.editGeneralOperation.bind(this);
            })

            this.deleteBtns = document.querySelectorAll('.deleteGeneralOperation')
            this.deleteBtns.forEach(deleteBtn => {
                deleteBtn.onclick = this.getIdClickElement.bind(this);
            })

        } else if (location.pathname === "/") {
            if(main && this.result) {
                main.paintDiagramms(this.result);
            }
        }
    }

    async getGeneralsOperationsFromBackend() {
        const accessToken = AuthTokens.getToken(AuthTokens.accessTokenKey);
        if (!accessToken) {
            console.log('No access token');
            return;
        }

        const result = await Response.getElementsFromBackend('GET', url.urlGenerals + this.period, accessToken);
        this.result = result;

        if (result && result.error) {
            console.log(`Error: ${result.message}`)
        }
    }

    private createTableWithOperations(): void {
        const tableElement: HTMLElement | null = document.querySelector('table');
        if (tableElement) {
            tableElement.remove();
        }
        const table = document.createElement('table');
        table.classList.add('table', 'mt-4', 'w-9');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['№ операции', 'Тип', 'Категория', 'Сумма', 'Дата', 'Комментарий', ''];

        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const tbody = document.createElement('tbody');

        const data = this.result;

        if(data && !('error' in data)) {
            data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

            let numGeneralRow: number = 1;

            data.forEach(item => {
                const row: HTMLElement = document.createElement('tr');
                row.classList.add('table-row');
                if(item.id) {
                    row.setAttribute('id', item.id.toString());
                }
                const idCell = document.createElement('th');
                idCell.classList.add('table-row-number');
                idCell.scope = 'row';
                idCell.innerText = numGeneralRow.toString();
                numGeneralRow += 1;
                row.appendChild(idCell);

                const typeCell = document.createElement('td');
                typeCell.classList.add('table-row-type');
                let type = null;

                if (item.type === 'income') {
                    type = 'доход';
                } else {
                    type = 'расход';
                }
                typeCell.textContent = type;
                typeCell.classList.add(type === 'доход' ? 'text-success' : 'text-danger');
                row.appendChild(typeCell);

                (['category', 'amount', 'date', 'comment'] as (keyof EditCreateGeneralResultResponse)[]).forEach((key, index) => {
                    const td = document.createElement('td');
                    if (item[key] === undefined) {
                        td.textContent = 'без категории';
                    } else {
                        td.textContent = item[key] as string;
                    }

                    const classes = ['table-row-category', 'table-row-amount', 'table-row-date', 'table-row-comment']
                    td.classList.add(classes[index]);
                    row.appendChild(td);
                });

                const actionsCell = document.createElement('td');
                const deleteLink = document.createElement('a');
                deleteLink.href = '/generals/popup';
                deleteLink.classList.add('me-2', 'deleteGeneralOperation');
                deleteLink.innerHTML = '<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                    '                        <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z"\n' +
                    '                              fill="black"/>\n' +
                    '                        <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z"\n' +
                    '                              fill="black"/>\n' +
                    '                        <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"\n' +
                    '                              fill="black"/>\n' +
                    '                        <path fill-rule="evenodd" clip-rule="evenodd"\n' +
                    '                              d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 ' +
                    '                              0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 ' +
                    '                              14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"\n' +
                    '                              fill="black"/>\n' +
                    '                    </svg>';
                actionsCell.appendChild(deleteLink);

                const editLink = document.createElement('a');
                editLink.href = '/generals/edit';
                editLink.classList.add('editGeneralOperation');
                editLink.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                    '                        <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 ' +
                    '                          3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 ' +
                    '                          16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 ' +
                    '                      10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 ' +
                    '                      9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 ' +
                    '                      10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 ' +
                    '                      11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z"\n' +
                    '                          fill="black"/>\n' +
                    '                  </svg>';
                actionsCell.appendChild(editLink);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        if (this.wrapperTable) {
            this.wrapperTable.appendChild(table);
        }
    }

    private editGeneralOperation(event: Event): void {
        const rowElement = event.target as HTMLElement;
        const row = rowElement.closest('.table-row');

        if(row) {
            const rowData: RowDataGeneralType = {
                type: null,
                category: null,
                amount: null,
                date: null,
                comment: null,
            }
            const typeElement: HTMLElement | null = row.querySelector('.table-row-type');
            const categoryElement: HTMLElement | null = row.querySelector('.table-row-category');
            const amountElement: HTMLElement | null = row.querySelector('.table-row-amount')
            const dateElement: HTMLElement | null = row.querySelector('.table-row-date')
            const commentElement: HTMLElement | null = row.querySelector('.table-row-comment')
            if(typeElement) {
                rowData.type = typeElement.innerText;
            }
            if(categoryElement) {
                rowData.category = categoryElement.innerText;
            }
            if(amountElement) {
                rowData.amount = amountElement.innerText;
            }
            if(dateElement) {
                rowData.date = dateElement.innerText;
            }
            if(commentElement) {
                rowData.comment = commentElement.innerText;
            }

            AuthTokens.setToken('rowData', JSON.stringify(rowData));
            AuthTokens.setToken('idRowGenerals', row.getAttribute('id') as string);
        }
    }

    private getIdClickElement(event: Event): void {
        event.preventDefault();
        const idRowElement: HTMLElement | null = (event.target as HTMLElement).closest('.table-row') as HTMLElement | null;
        if(idRowElement) {
            const idRow: string | null = idRowElement.getAttribute('id');
            if(idRow) {
                AuthTokens.setToken('idRowGenerals', idRow)
            }
        }
    }

    private resize(): void {
        if (window.innerWidth < 1550 && window.innerWidth > 900) {
            if(main && this.result) {
                main.paintDiagramms(this.result);
            }
        }
    }
}
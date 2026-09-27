import {CreateCart} from "../categories/createCarts";

export class Expenses {
    readonly incomeElements: HTMLElement | null;
    constructor() {
        this.incomeElements = document.querySelector('.income-elements');
        new CreateCart('/categories/expense', '/expenses/edit', '/expenses/popup', '/expenses/create', this.incomeElements);
    }
}
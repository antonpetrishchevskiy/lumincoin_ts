import {CreateCart} from "../categories/createCarts";

export class Incomes {
    readonly incomeElements: HTMLElement | null;
    constructor() {
        this.incomeElements = document.querySelector('.income-elements');
        new CreateCart('/categories/income','/incomes/edit', '/incomes/popup', '/incomes/create', this.incomeElements);
    }
}
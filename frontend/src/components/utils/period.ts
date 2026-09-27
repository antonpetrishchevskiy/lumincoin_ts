import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {GetDataUtils} from "./getData-utils";
import {Generals} from "../generals/generals";

export class Period {
    readonly periodBtns: NodeListOf<HTMLElement>;
    readonly today: Date;
    readonly dataInputFrom: HTMLInputElement | null;
    readonly dataInputTo: HTMLInputElement | null;
    private activeButton: HTMLElement | null = null;
    private dataInputFromValue = '';
    private dataInputToValue = '';
    private period: string | null = null;

    constructor() {
        this.periodBtns = document.querySelectorAll('.btn-period');
        this.today = new Date();

        this.periodBtns.forEach(button => {
            button.onclick = this.clickPeriodButton.bind(this);
        });

        this.dataInputFrom = document.getElementById('dataInputFrom') as HTMLInputElement | null;
        this.dataInputTo = document.getElementById('dataInputTo') as HTMLInputElement | null;

        this.dataInputFromValue = this.dataInputFrom?.value ?? '';
        this.dataInputToValue = this.dataInputTo?.value ?? '';
    }

    private clickPeriodButton(event: Event): void {
        const button = event.currentTarget as HTMLElement | null;
        if (!button) {
            return;
        }

        this.periodBtns.forEach(periodButton => {
            periodButton.toggleAttribute('disabled', periodButton !== button);
        });

        this.activeButton = button;
        this.createUrlPeriod();
    }

    private createUrlPeriod(): void {
        this.dataInputFrom?.classList.add('inactive');
        this.dataInputTo?.classList.add('inactive');

        const today = GetDataUtils.getData(this.today);
        const buttonText = this.activeButton?.innerText;

        if (!buttonText) {
            return;
        }

        switch (buttonText) {
            case 'Сегодня':
                this.period = `?period=${today}`;
                break;

            case 'Неделя': {
                const monday = new Date(this.today);
                const dayOfWeek = monday.getDay();
                monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                this.period = `?period=interval&dateFrom=${GetDataUtils.getData(monday)}&dateTo=${today}`;
                break;
            }

            case 'Месяц': {
                const month = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
                this.period = `?period=interval&dateFrom=${GetDataUtils.getData(month)}&dateTo=${today}`;
                break;
            }

            case 'Год': {
                const year = new Date(this.today.getFullYear(), 0, 1);
                this.period = `?period=interval&dateFrom=${GetDataUtils.getData(year)}&dateTo=${today}`;
                break;
            }

            case 'Все':
                this.period = '?period=all';
                break;

            case 'Интервал':
                this.enableCustomInterval();
                return;
        }

        new Generals(this.period);
    }

    private enableCustomInterval(): void {
        if (!this.dataInputFrom || !this.dataInputTo) {
            return;
        }

        this.dataInputFrom.classList.remove('inactive');
        this.dataInputTo.classList.remove('inactive');

        flatpickr(this.dataInputFrom, {
            dateFormat: "Y-m-d",
            locale: Russian,
        });

        flatpickr(this.dataInputTo, {
            dateFormat: "Y-m-d",
            locale: Russian,
        });

        this.dataInputFrom.onchange = this.changeData.bind(this);
        this.dataInputTo.onchange = this.changeData.bind(this);
    }

    private changeData(event: Event): void {
        const eventTarget = event.currentTarget as HTMLInputElement | null;
        if (!eventTarget) {
            return;
        }

        if (eventTarget.id === 'dataInputFrom') {
            this.dataInputFromValue = eventTarget.value;
        } else if (eventTarget.id === 'dataInputTo') {
            this.dataInputToValue = eventTarget.value;
        }

        if (this.dataInputFromValue && this.dataInputToValue) {
            this.period = `?period=interval&dateFrom=${this.dataInputFromValue}&dateTo=${this.dataInputToValue}`;
            new Generals(this.period);
        }
    }
}

import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {GetDataUtils} from "./getData-utils";
import {Generals} from "../generals/generals";

export class Period {
    readonly periodBtns: NodeListOf<HTMLElement> | null;
    private activeButton : HTMLElement | null;
    readonly today: Date | null;
    readonly dataInputFrom: HTMLInputElement | null;
    readonly dataInputTo: HTMLInputElement | null;
    private dataInputFromValue: string | null = null;
    private dataInputToValue: string | null = null;
    private period: string | null = null;

    constructor() {
        this.periodBtns = document.querySelectorAll('.btn-period');
        this.activeButton = null;
        this.today = new Date();
        this.periodBtns.forEach(button => {
            button.onclick = this.clickPeriodButton.bind(this);
        })
        this.dataInputFrom = document.getElementById('dataInputFrom') as HTMLInputElement;
        this.dataInputTo = document.getElementById('dataInputTo') as HTMLInputElement;
        if(this.dataInputFrom) {
            this.dataInputFromValue = this.dataInputFrom.value;
        }
        if(this.dataInputTo) {
            this.dataInputToValue = this.dataInputTo.value;
        }
    }

    private clickPeriodButton(event: Event): void {
        if(this.periodBtns) {
            this.periodBtns.forEach(button => {
                if(event.target) {
                    const element = event.target as HTMLElement;
                    if (element.textContent === button.textContent) {
                        button.setAttribute('disabled', 'disabled');
                        this.activeButton = button;
                        this.createUrlPeriod();
                    } else {
                        button.removeAttribute('disabled');
                    }
                }
            })
        }
    }

    private createUrlPeriod(): void {
        if(this.dataInputFrom) {
            this.dataInputFrom.classList.add('inactive');
        }
        if(this.dataInputTo) {
            this.dataInputTo.classList.add('inactive');
        }
        const today = GetDataUtils.getData(this.today);

        if(this.activeButton) {

            if (this.activeButton.innerText === 'Сегодня') {
                this.period = `?period=${today}`;
            } else if (this.activeButton.innerText === 'Неделя') {
                if(this.today) {
                    const dayOfWeek = this.today.getDay();
                    let monday: Date | string | null = new Date(this.today);
                    monday.setDate(this.today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    monday = GetDataUtils.getData(monday);
                    this.period = `?period=interval&dateFrom=${monday}&dateTo=${today}`;
                }
            } else if (this.activeButton.innerText === 'Месяц' && this.today) {
                const month: string | null = GetDataUtils.getData(new Date(this.today.setDate(1)));
                this.period = `?period=interval&dateFrom=${month}&dateTo=${today}`;
            } else if (this.activeButton.innerText === 'Год' && this.today) {
                const year: string = GetDataUtils.getData(new Date(this.today.setMonth(0, 1)));
                this.period = `?period=interval&dateFrom=${year}&dateTo=${today}`;
            } else if (this.activeButton.innerText === 'Все') {
                this.period = `?period=all`;
            } else if (this.activeButton.innerText === 'Интервал') {
                if(this.dataInputFrom && this.dataInputTo) {
                    this.dataInputFrom.classList.remove('inactive');
                    this.dataInputTo.classList.remove('inactive');
                    flatpickr("#dataInputFrom", {
                        dateFormat: "Y-m-d",
                        locale: Russian,
                    });
                    flatpickr("#dataInputTo", {
                        dateFormat: "Y-m-d",
                        locale: Russian,
                    });

                    this.dataInputFrom.addEventListener('change', this.changeData.bind(this));
                    this.dataInputTo.addEventListener('change', this.changeData.bind(this));
                }
            }
            if (this.activeButton.innerText !== 'Интервал') {
                new Generals(this.period);
            }
        }
    }

    private changeData(event: Event): void {
        const eventTarget = event.target as HTMLInputElement;
        if (eventTarget.id === 'dataInputFrom') {
            this.dataInputFromValue = eventTarget.value;
        } else {
            this.dataInputToValue = eventTarget.value;
        }

        if(this.dataInputFromValue !== '' && this.dataInputToValue !== '') {
            this.period  = `?period=interval&dateFrom=${this.dataInputFromValue}&dateTo=${this.dataInputToValue}`;
            new Generals(this.period);
        }
    }
}
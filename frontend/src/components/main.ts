import {Period} from "./utils/period";
import Chart from 'chart.js/auto';
import {EditCreateGeneralResultResponse, ErrorResultResponse} from "../types/result-response.type";

export class Main {
    public canvas1: HTMLCanvasElement | null;
    public canvas2: HTMLCanvasElement | null;
    private chartExpenses: Chart | null;
    private chartIncomes: Chart | null;
    private result: EditCreateGeneralResultResponse[] | ErrorResultResponse | null;
    private mapIncomes: Map<string, number> | null;
    private mapExpenses: Map<string, number> | null;
    readonly categoryIncomes: string[];
    readonly amountIncomes: number[];
    readonly categoryExpenses: string[];
    readonly amounExpenses: number[];

    constructor() {
        this.canvas1 = null;
        this.canvas2 = null;
        this.result = null;
        this.chartExpenses = null;
        this.chartIncomes = null;
        this.mapIncomes = null;
        this.mapExpenses = null;
        this.categoryIncomes = [];
        this.amountIncomes = [];
        this.categoryExpenses = [];
        this.amounExpenses = [];
        new Period();
    }

    public paintDiagramms(result: EditCreateGeneralResultResponse[] | ErrorResultResponse) {
        if (this.chartExpenses) {
            this.chartExpenses.destroy();
            this.chartExpenses = null;
        }

        if (this.chartIncomes) {
            this.chartIncomes.destroy();
            this.chartIncomes = null;;
        }

        this.result = result;
        this.canvas1 = document.getElementById('myChart') as HTMLCanvasElement | null;
        this.canvas2 = document.getElementById('myChart2') as HTMLCanvasElement | null;

        this.mapIncomes = new Map();
        this.mapExpenses = new Map();

        if (!('error' in this.result)) {
            this.result.forEach(item => {
                if (item.type === 'income') {
                    let i = 0;
                    if (this.mapIncomes && item.category) {
                        if (!this.categoryIncomes.includes(item.category) && item.category !== undefined && item.amount) {
                            this.categoryIncomes.push(item.category);
                            this.mapIncomes.set(item.category, item.amount);
                        } else if (!this.categoryIncomes.includes('без категории') && item.category === undefined && item.amount) {
                            this.categoryIncomes.push('без категории');
                            this.mapIncomes.set('без категории', item.amount);
                        } else if (this.categoryIncomes.includes('без категории') && item.category === undefined && item.amount) {
                            const currentAmount: number | string | undefined = this.mapIncomes.get('без категории');
                            if (currentAmount) {
                                this.mapIncomes.set('без категории', +currentAmount + item.amount);
                            }
                        } else if (item.amount) {
                            const currentAmount: number | string | undefined = this.mapIncomes.get(item.category);
                            if (currentAmount) {
                                this.mapIncomes.set(item.category, +currentAmount + item.amount);
                            }
                        }
                    }
                } else if (item.type === 'expense') {
                    let i = 0;
                    if (this.mapExpenses && item.category) {
                        if (!this.categoryExpenses.includes(item.category) && item.category !== undefined && item.amount) {
                            this.categoryExpenses.push(item.category);
                            this.mapExpenses.set(item.category, item.amount);
                        } else if (!this.categoryExpenses.includes('без категории') && item.category === undefined && item.amount) {
                            this.categoryExpenses.push('без категории');
                            this.mapExpenses.set('без категории', item.amount);
                        } else if (this.categoryExpenses.includes('без категории') && item.category === undefined && item.amount) {
                            const currentAmount: number | string | undefined = this.mapExpenses.get('без категории');
                            if (currentAmount) {
                                this.mapExpenses.set('без категории', +currentAmount + item.amount);
                            }
                        } else if (item.amount) {
                            const currentAmount: number | string | undefined = this.mapExpenses.get(item.category);
                            if (currentAmount) {
                                this.mapExpenses.set(item.category, +currentAmount + item.amount);
                            }
                        }
                    }
                }
            })
        }

        this.categoryIncomes.forEach(item => {
            const value: number | undefined = this.mapIncomes!.get(item);
            if (value) {
                this.amountIncomes.push(value);
            }
        })

        this.categoryExpenses.forEach(item => {
            const value: number | undefined = this.mapExpenses!.get(item);
            if (value) {
                this.amounExpenses.push(value);
            }
        })

        if (this.canvas1) {
            this.chartIncomes = new Chart(this.canvas1, {
                type: 'pie',
                data: {
                    labels: this.categoryIncomes,
                    datasets: [{
                        data: this.amountIncomes,
                        backgroundColor: [
                            'rgb(218,53,68)',
                            'rgb(251,125,20)',
                            'rgb(253,191,7)',
                            'rgb(32,199,150)',
                            'rgb(13,109,251)',
                            'rgb(113,9,151)',
                            'rgb(18,213,218)',
                            'rgb(201,205,100)',
                            'rgb(253,1,127)',
                            'rgb(132,9,250)',
                            'rgb(13,29,251)',
                            'rgb(118,13,18)',
                            'rgb(151,25,20)',
                            'rgb(193,91,17)',
                            'rgb(102,99,50)',
                        ]
                    }]
                },
            });
        }
        if (this.canvas2) {
            this.chartExpenses = new Chart(this.canvas2, {
                type: 'pie',
                data: {
                    labels: this.categoryExpenses,
                    datasets: [{
                        data: this.amounExpenses,
                        backgroundColor: [
                            'rgb(218,53,68)',
                            'rgb(251,125,20)',
                            'rgb(253,191,7)',
                            'rgb(32,199,150)',
                            'rgb(13,109,251)',
                            'rgb(113,9,151)',
                            'rgb(18,213,218)',
                            'rgb(201,205,100)',
                            'rgb(253,1,127)',
                            'rgb(132,9,250)',
                            'rgb(13,29,251)',
                            'rgb(118,13,18)',
                            'rgb(151,25,20)',
                            'rgb(193,91,17)',
                            'rgb(102,99,50)',
                        ]
                    }]
                },
            });
        }
    }
}

export const main: Main = new Main();
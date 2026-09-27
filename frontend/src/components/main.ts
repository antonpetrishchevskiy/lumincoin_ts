import Chart from 'chart.js/auto';
import {EditCreateGeneralResultResponse, ErrorResultResponse} from "../types/result-response.type";

const CHART_COLORS = [
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
];

const UNCATEGORIZED = 'без категории';

type ChartData = {
    labels: string[];
    values: number[];
};

export class Main {
    private chartExpenses: Chart | null = null;
    private chartIncomes: Chart | null = null;

    public paintDiagramms(result: EditCreateGeneralResultResponse[] | ErrorResultResponse): void {
        this.destroyCharts();

        if ('error' in result) {
            return;
        }

        const incomeData = this.createChartData(result, 'income');
        const expenseData = this.createChartData(result, 'expense');

        const canvasIncomes = document.getElementById('myChart') as HTMLCanvasElement | null;
        const canvasExpenses = document.getElementById('myChart2') as HTMLCanvasElement | null;

        if (canvasIncomes) {
            this.chartIncomes = this.createChart(canvasIncomes, incomeData);
        }

        if (canvasExpenses) {
            this.chartExpenses = this.createChart(canvasExpenses, expenseData);
        }
    }

    private createChartData(
        result: EditCreateGeneralResultResponse[],
        type: 'income' | 'expense',
    ): ChartData {
        const amountsByCategory = new Map<string, number>();

        result
            .filter(item => item.type === type)
            .forEach(item => {
                const category = item.category ?? UNCATEGORIZED;
                const amount = Number(item.amount ?? 0);
                amountsByCategory.set(category, (amountsByCategory.get(category) ?? 0) + amount);
            });

        return {
            labels: Array.from(amountsByCategory.keys()),
            values: Array.from(amountsByCategory.values()),
        };
    }

    private createChart(canvas: HTMLCanvasElement, data: ChartData): Chart {
        return new Chart(canvas, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: CHART_COLORS,
                }],
            },
        });
    }

    private destroyCharts(): void {
        this.chartExpenses?.destroy();
        this.chartIncomes?.destroy();
        this.chartExpenses = null;
        this.chartIncomes = null;
    }
}

export const main: Main = new Main();

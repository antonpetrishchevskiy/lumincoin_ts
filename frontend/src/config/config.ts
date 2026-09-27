import {ConfigHostType, ConfigUrlType} from "../types/config.type";

const host: string = 'http://localhost:3000';
export const config: ConfigHostType = {
    host: host,
    api: host + '/api',
}

export const url: ConfigUrlType = {
    changeExpenses:'/categories/expense/',
    changeIncomes:'/categories/income/',
    urlGenerals: '/operations',
}
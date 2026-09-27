import { Login } from "./components/auth/login";
import { SignUp } from "./components/auth/sign-up";
import { AuthTokens } from "./components/utils/auth-utils";
import { Logout } from "./components/auth/logout";
import { Expenses } from "./components/expenses/expenses";
import { Incomes } from "./components/incomes/incomes";
import { EditCarts } from "./components/categories/editCarts";
import { url } from "./config/config";
import { AddCart } from "./components/categories/addCarts";
import { DeleteCart } from "./components/categories/deleteCarts";
import { Response } from "./components/utils/response-utils";
import { Generals } from "./components/generals/generals";
import { EditGeneralOperation } from "./components/generals/editGeneralOperation";
import { CreateGeneralOperation } from "./components/generals/createGeneralOperation";
import { DeleteGeneralElement } from "./components/generals/deleteGeneralElement";
import { Layout } from "./components/layout";
import { RoutesType, UserInfoType } from "./types/router.type";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentElement: HTMLElement | null;
    private routes: RoutesType[];
    private refreshIntervalId: number | null = null;

    constructor() {
        this.titlePageElement = document.getElementById('page-title');
        this.contentElement = document.getElementById('content');
        this.initEvents();
        new AuthTokens(this.openNewRouteAutomatic.bind(this));

        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Generals();
                },
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/auth/login.html',
                load: () => {
                    new Login(this.openNewRouteAutomatic.bind(this));
                },
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/auth/sign-up.html',
                load: () => {
                    new SignUp(this.openNewRouteAutomatic.bind(this));
                },
            },
            {
                route: '/404',
                title: 'Ошибка',
                filePathTemplate: '/templates/pages/404.html',
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                },
            },
            {
                route: '/expenses/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/expenses/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new AddCart(this.openNewRouteAutomatic.bind(this), url.changeExpenses, '/expenses');
                },
            },
            {
                route: '/expenses/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/expenses/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditCarts(this.openNewRouteAutomatic.bind(this), url.changeExpenses, '/expenses');
                },
            },
            {
                route: '/expenses/popup',
                title: 'Попап',
                filePathTemplate: '/templates/pages/expenses/main.html',
                useLayout: '/templates/layout.html',
                usePopup: '/templates/pages/expenses/popup.html',
                load: () => {
                    new Expenses();
                    new DeleteCart(this.openNewRouteAutomatic.bind(this), url.changeExpenses, '/expenses');
                },
            },
            {
                route: '/generals',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/generals/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Generals();
                },
            },
            {
                route: '/generals/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/generals/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateGeneralOperation(this.openNewRouteAutomatic.bind(this), url.urlGenerals, '/generals');
                },
            },
            {
                route: '/generals/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/generals/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditGeneralOperation(this.openNewRouteAutomatic.bind(this), url.urlGenerals + '/', '/generals');
                },
            },
            {
                route: '/generals/popup',
                title: 'Попап',
                filePathTemplate: '/templates/pages/generals/main.html',
                useLayout: '/templates/layout.html',
                usePopup: '/templates/pages/generals/popup.html',
                load: () => {
                    new Generals();
                    new DeleteGeneralElement(this.openNewRouteAutomatic.bind(this), url.urlGenerals + '/', '/generals');
                },
            },
            {
                route: '/incomes',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/incomes/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Incomes();
                },
            },
            {
                route: '/incomes/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/incomes/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new AddCart(this.openNewRouteAutomatic.bind(this), url.changeIncomes, '/incomes');
                },
            },
            {
                route: '/incomes/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/incomes/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditCarts(this.openNewRouteAutomatic.bind(this), url.changeIncomes, '/incomes');
                },
            },
            {
                route: '/incomes/popup',
                title: 'Попап',
                filePathTemplate: '/templates/pages/incomes/main.html',
                useLayout: '/templates/layout.html',
                usePopup: '/templates/pages/incomes/popup.html',
                load: () => {
                    new Incomes();
                    new DeleteCart(this.openNewRouteAutomatic.bind(this), url.changeIncomes, '/incomes');
                },
            },
        ]
    }

    private initEvents(): void {
        window.addEventListener("DOMContentLoaded", this.activateRoute.bind(this));
        window.addEventListener("popstate", this.activateRoute.bind(this));
        document.addEventListener('click', this.openNewRouteToClick.bind(this));
        this.refreshTokenAutomatic();
    }

    private async openNewRouteAutomatic(url: string): Promise<void> {
        history.pushState(null, '', url);
        await this.activateRoute();
    }

    private async openNewRouteToClick(e: Event): Promise<void> {
        let element: EventTarget | null = null;
        if ((e.target as HTMLAnchorElement).nodeName === 'A') {
            element = e.target;
        } else if ((e.target as HTMLAnchorElement).parentNode) {
            const parentElement = (e.target as HTMLAnchorElement).parentNode as HTMLElement;
            if (parentElement.nodeName === 'A') {
                element = (e.target as HTMLAnchorElement).parentNode;
            }
        }

        if (element) {
            e.preventDefault();
            const url = (element as HTMLAnchorElement).href.replace(window.location.origin, '');
            if (!(element as HTMLAnchorElement).href || (element as HTMLAnchorElement).href === '#' || (element as HTMLAnchorElement).href === 'javascript:void(0)') {
                return;
            }
            await this.openNewRouteAutomatic(url);
        }
    }

    async activateRoute(): Promise<void> {
        const urlRoute: string = window.location.pathname;
        let newRoute: RoutesType | undefined;

        const hasAccessToken = !!localStorage.getItem("accessToken");
        const hasRefreshToken = !!localStorage.getItem("refreshToken");

        if (hasAccessToken || hasRefreshToken) {
            // Если accessToken отсутствует, но refreshToken есть — пробуем обновить
            if (!hasAccessToken && hasRefreshToken) {
                try {
                    await AuthTokens.refreshToken();
                    // refreshToken() ничего не возвращает, поэтому проверяем localStorage:
                    // если accessToken появился — refresh удался, иначе — пользователя на /login
                    if (!localStorage.getItem("accessToken")) {
                        newRoute = this.routes.find((route) => route.route === '/login');
                    }
                } catch {
                    newRoute = this.routes.find((route) => route.route === '/login');
                }
            }

            if (!newRoute) {
                newRoute = this.routes.find((route) => route.route === urlRoute);
            }
        } else {
            newRoute = this.routes.find((route) => route.route === '/login');
            if (urlRoute === '/sign-up') {
                newRoute = this.routes.find((route) => route.route === '/sign-up');
            }
            if (urlRoute === '/login') {
                newRoute = this.routes.find((route) => route.route === '/login');
            }
        }

        if (newRoute) {
            if (newRoute.title) {
                if (this.titlePageElement) {
                    this.titlePageElement.innerText = newRoute.title + '| Lumincoin Finance';
                }
            }

            if (newRoute.useLayout) {
                if (this.contentElement) {
                    this.contentElement.innerHTML = await fetch(newRoute.useLayout).then(res => res.text());
                    const userInfoJson: string | null = localStorage.getItem("userInfo");
                    if (userInfoJson) {
                        const userInfo: UserInfoType = JSON.parse(userInfoJson);
                        const layoutUserNameElement: HTMLElement | null = document.getElementById('layoutUserName');
                        if (layoutUserNameElement) {
                            layoutUserNameElement.innerText = userInfo.name + ` ` + userInfo.lastName;
                        }
                    }
                }

                const userBalanceElement: HTMLElement | null = document.getElementById('userBalance');

                try {
                    const accessToken: string | null = AuthTokens.getToken(AuthTokens.accessTokenKey);
                    if (accessToken) {
                        const result = await Response.getElementsFromBackend('GET', '/balance', accessToken);

                        if (result.error) {
                            console.error('Ошибка получения баланса!', result.error);
                        }

                        if (result && result.balance !== 'undefined' && userBalanceElement) {
                            userBalanceElement.innerText = result.balance + ' $';
                        } else {
                            if (userBalanceElement) {
                                userBalanceElement.innerText = '0 $';
                            }
                        }
                    }
                } catch (error) {
                    console.error("Ошибка при получении баланса:", error);
                    if (userBalanceElement) {
                        userBalanceElement.innerText = 'Ошибка загрузки';
                    }
                }
            } else {
                if (this.contentElement) {
                    this.contentElement.innerHTML = '';
                }
            }

            if (newRoute.filePathTemplate && this.contentElement) {
                this.contentElement.innerHTML += await fetch(newRoute.filePathTemplate).then(res => res.text());
            }

            if (newRoute.usePopup && this.contentElement) {
                this.contentElement.innerHTML += await fetch(newRoute.usePopup).then(res => res.text());
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

            if (newRoute.useLayout) {
                new Logout(this.openNewRouteAutomatic.bind(this));
                new Layout();
            }

        } else {
            window.location.href = '/404';
        }
    }

    refreshTokenAutomatic(): void {
        // Не создаём новый интервал, если он уже существует
        if (this.refreshIntervalId !== null) {
            return;
        }
        this.refreshIntervalId = window.setInterval(async () => {
            // Обновляем токен в фоне, без навигации и перезагрузки
            try {
                await AuthTokens.refreshToken();
            } catch (error) {
                console.error('Ошибка обновления токена:', error);
            }
        }, 250000);
    }
}
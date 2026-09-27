import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {AuthTokens} from "./components/utils/auth-utils";
import {Logout} from "./components/auth/logout";
import {Expenses} from "./components/expenses/expenses";
import {Incomes} from "./components/incomes/incomes";
import {EditCarts} from "./components/categories/editCarts";
import {url} from "./config/config";
import {AddCart} from "./components/categories/addCarts";
import {DeleteCart} from "./components/categories/deleteCarts";
import {Response} from "./components/utils/response-utils";
import {Generals} from "./components/generals/generals";
import {EditGeneralOperation} from "./components/generals/editGeneralOperation";
import {CreateGeneralOperation} from "./components/generals/createGeneralOperation";
import {DeleteGeneralElement} from "./components/generals/deleteGeneralElement";
import {Layout} from "./components/layout";
import {RoutesType, UserInfoType} from "./types/router.type";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentElement: HTMLElement | null;
    private readonly routes: RoutesType[];

    constructor() {
        this.titlePageElement = document.getElementById('page-title');
        this.contentElement = document.getElementById('content');

        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/main.html',
                useLayout: '/templates/layout.html',
                load: () => new Generals(),
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/auth/login.html',
                load: () => new Login(this.openNewRouteAutomatic.bind(this)),
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/auth/sign-up.html',
                load: () => new SignUp(this.openNewRouteAutomatic.bind(this)),
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
                load: () => new Expenses(),
            },
            {
                route: '/expenses/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/expenses/create.html',
                useLayout: '/templates/layout.html',
                load: () => new AddCart(this.openNewRouteAutomatic.bind(this), url.changeExpenses, '/expenses'),
            },
            {
                route: '/expenses/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/expenses/edit.html',
                useLayout: '/templates/layout.html',
                load: () => new EditCarts(this.openNewRouteAutomatic.bind(this), url.changeExpenses, '/expenses'),
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
                load: () => new Generals(),
            },
            {
                route: '/generals/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/generals/create.html',
                useLayout: '/templates/layout.html',
                load: () => new CreateGeneralOperation(this.openNewRouteAutomatic.bind(this), url.urlGenerals, '/generals'),
            },
            {
                route: '/generals/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/generals/edit.html',
                useLayout: '/templates/layout.html',
                load: () => new EditGeneralOperation(this.openNewRouteAutomatic.bind(this), url.urlGenerals + '/', '/generals'),
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
                load: () => new Incomes(),
            },
            {
                route: '/incomes/create',
                title: 'Создание',
                filePathTemplate: '/templates/pages/incomes/create.html',
                useLayout: '/templates/layout.html',
                load: () => new AddCart(this.openNewRouteAutomatic.bind(this), url.changeIncomes, '/incomes'),
            },
            {
                route: '/incomes/edit',
                title: 'Редактирование',
                filePathTemplate: '/templates/pages/incomes/edit.html',
                useLayout: '/templates/layout.html',
                load: () => new EditCarts(this.openNewRouteAutomatic.bind(this), url.changeIncomes, '/incomes'),
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
        ];

        this.initEvents();
    }

    private initEvents(): void {
        window.addEventListener("DOMContentLoaded", () => {
            this.activateRoute().catch(console.error);
        });
        window.addEventListener("popstate", () => {
            this.activateRoute().catch(console.error);
        });
        document.addEventListener('click', (event) => {
            this.openNewRouteToClick(event).catch(console.error);
        });
    }

    private async openNewRouteAutomatic(path: string): Promise<void> {
        history.pushState(null, '', path);
        await this.activateRoute();
    }

    private async openNewRouteToClick(event: Event): Promise<void> {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest('a');
        if (!link || !link.href || link.target === '_blank' || link.origin !== window.location.origin) {
            return;
        }

        const path = link.pathname + link.search + link.hash;
        if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {
            return;
        }

        event.preventDefault();
        await this.openNewRouteAutomatic(path);
    }

    private async activateRoute(): Promise<void> {
        const urlRoute = window.location.pathname;
        const accessToken = await AuthTokens.ensureAccessToken();
        const isPublicRoute = urlRoute === '/login' || urlRoute === '/sign-up' || urlRoute === '/404';

        if (!accessToken && !isPublicRoute) {
            await this.openNewRouteAutomatic('/login');
            return;
        }

        const newRoute = this.routes.find((route) => route.route === urlRoute)
            ?? (accessToken ? this.routes.find((route) => route.route === '/404') : this.routes.find((route) => route.route === '/login'));

        if (!newRoute || !this.contentElement) {
            return;
        }

        if (newRoute.title && this.titlePageElement) {
            this.titlePageElement.innerText = newRoute.title + '| Lumincoin Finance';
        }

        this.contentElement.innerHTML = '';

        if (newRoute.useLayout) {
            this.contentElement.innerHTML = await this.loadTemplate(newRoute.useLayout);
            this.renderUserInfo();
            await this.renderBalance();
        }

        if (newRoute.filePathTemplate) {
            this.contentElement.innerHTML += await this.loadTemplate(newRoute.filePathTemplate);
        }

        if (newRoute.usePopup) {
            this.contentElement.innerHTML += await this.loadTemplate(newRoute.usePopup);
        }

        newRoute.load?.();

        if (newRoute.useLayout) {
            new Logout(this.openNewRouteAutomatic.bind(this));
            new Layout();
        }
    }

    private async renderBalance(): Promise<void> {
        const userBalanceElement = document.getElementById('userBalance');
        const accessToken = await AuthTokens.ensureAccessToken();

        if (!userBalanceElement || !accessToken) {
            return;
        }

        try {
            const result = await Response.getElementsFromBackend<{ balance?: number | string }>(
                'GET',
                '/balance',
                accessToken
            );

            if ('error' in result && result.error) {
                userBalanceElement.innerText = 'Ошибка загрузки';
                return;
            }

            if ('balance' in result) {
                userBalanceElement.innerText = result.balance !== undefined
                    ? result.balance + ' $'
                    : '0 $';
            } else {
                userBalanceElement.innerText = '0 $';
            }
        } catch (error) {
            console.error('Ошибка при получении баланса:', error);
            userBalanceElement.innerText = 'Ошибка загрузки';
        }
    }

    private renderUserInfo(): void {
        const userInfoJson = AuthTokens.getToken(AuthTokens.userInfoTokenKey);
        const layoutUserNameElement = document.getElementById('layoutUserName');

        if (!userInfoJson || !layoutUserNameElement) {
            return;
        }

        try {
            const userInfo: UserInfoType = JSON.parse(userInfoJson);
            layoutUserNameElement.innerText = userInfo.name + ' ' + userInfo.lastName;
        } catch (error) {
            console.error('Invalid user info in storage:', error);
            AuthTokens.removeToken(AuthTokens.userInfoTokenKey);
        }
    }

    private async loadTemplate(path: string): Promise<string> {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить шаблон: ${path}`);
        }

        return response.text();
    }
}
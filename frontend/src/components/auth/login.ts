import {Validation} from "../utils/validation";
import {AuthTokens} from "../utils/auth-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {DataValidationType} from "../../types/validation.type";
import {ErrorResultResponse, LoginResultResponse} from "../../types/result-response.type";
import {FormUtils} from "../utils/reset-validation";

export class Login {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly inputsElement: NodeListOf<HTMLInputElement>;
    readonly rememberMeInput: HTMLInputElement | null;
    readonly errorLogin: HTMLElement | null;
    readonly loginBtn: HTMLButtonElement | null;
    readonly formElement: HTMLFormElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.inputsElement = document.querySelectorAll('.form-floating input');
        this.rememberMeInput = document.getElementById('remember-meInput') as HTMLInputElement | null;
        this.errorLogin = document.getElementById('error-login');
        this.loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null;
        this.formElement = document.querySelector('form');

        this.formElement?.addEventListener('submit', (event) => {
            event.preventDefault();
            this.login().catch(() => {
                if (this.errorLogin) {
                    this.errorLogin.innerText = 'Ошибка при подключении к серверу. Проверьте соединение.';
                }
            });
        });

    }

    private async login(): Promise<void> {
        if (!this.errorLogin || !this.loginBtn) {
            return;
        }

        FormUtils.resetValidationErrors(this.inputsElement, this.errorLogin);

        const data: DataValidationType | null = Validation.validForm(this.inputsElement);
        if (!data?.emailInputElement || !data.passwordInputElement) {
            return;
        }

        this.loginBtn.disabled = true;

        try {
            const rememberMe = Boolean(this.rememberMeInput?.checked);
            const result: LoginResultResponse | ErrorResultResponse = await AuthTokens.login(
                data.emailInputElement,
                data.passwordInputElement,
                rememberMe
            );

            if ('error' in result && result.error) {
                this.errorLogin.innerText = result.message || 'Не удалось выполнить вход';
                return;
            }

            await this.openNewRouteAutomatic('/');
        } finally {
            this.loginBtn.disabled = false;
        }
    }
}

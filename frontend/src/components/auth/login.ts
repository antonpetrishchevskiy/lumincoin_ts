import {Validation} from "../utils/validation";
import {AuthTokens} from "../utils/auth-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {DataValidationType} from "../../types/validation.type";
import {ErrorResultResponse, LoginResultResponse} from "../../types/result-response.type";
import {FormUtils} from "../utils/reset-validation";

export class Login {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly inputsElement: NodeListOf<HTMLInputElement> | null;
    readonly rememberMeInput: HTMLElement | null;
    readonly errorLogin: HTMLElement | null;
    readonly loginBtn: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.inputsElement = document.querySelectorAll('.form-floating  input');
        this.rememberMeInput = document.getElementById('remember-meInput');
        this.errorLogin = document.getElementById('error-login');
        this.loginBtn = document.getElementById('loginBtn');
        if (this.loginBtn) {
            this.loginBtn.addEventListener("click", this.login.bind(this));
        }
    }

    private async login(): Promise<void> {
        if (!this.inputsElement || !this.errorLogin) return;

        FormUtils.resetValidationErrors(this.inputsElement, this.errorLogin);

        if (!Validation.validForm(this.inputsElement)) {
            return;
        }

        const date: DataValidationType | null = Validation.validForm(this.inputsElement);

        if (date && date.emailInputElement && date.passwordInputElement) {
            const emailInputElement: string = date.emailInputElement;
            const passwordInputElement: string = date.passwordInputElement;
            const rememberMeInput: boolean = (this.rememberMeInput as HTMLInputElement).checked;

            try {
                const result: LoginResultResponse | ErrorResultResponse | undefined = await AuthTokens.getTokensAfterRegistration(
                    emailInputElement,
                    passwordInputElement,
                    rememberMeInput
                );

                if (!result) {
                    this.errorLogin.innerText = 'Ошибка при запросе на сервер. Попробуйте снова!';
                    return;
                }

                if ('error' in result || !('tokens' in result) || !('user' in result)) {
                    this.errorLogin.innerText = result.message || 'Неизвестная ошибка';
                    return;
                }

                this.errorLogin.innerText = '';
                this.openNewRouteAutomatic('/').then();

            } catch (error) {
                this.errorLogin.innerText = 'Ошибка при подключении к серверу. Проверьте соединение.';
                console.error('Login error:', error);
            }
        }
    }
}
import {Validation} from "../utils/validation";
import {AuthTokens} from "../utils/auth-utils";
import {ErrorResultResponse, SignUpResultResponse} from "../../types/result-response.type";
import {DataValidationType} from "../../types/validation.type";
import {FormUtils} from "../utils/reset-validation";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {Response} from "../utils/response-utils";

export class SignUp {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly inputsElement: NodeListOf<HTMLInputElement>;
    readonly errorSignUp: HTMLElement | null;
    readonly signUpBtn: HTMLButtonElement | null;
    readonly formElement: HTMLFormElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.inputsElement = document.querySelectorAll('.form-floating input');
        this.errorSignUp = document.getElementById('error-signUp');
        this.signUpBtn = document.getElementById('signUpBtn') as HTMLButtonElement | null;
        this.formElement = document.querySelector('form');

        this.formElement?.addEventListener('submit', (event) => {
            event.preventDefault();
            this.signUp().catch(() => {
                if (this.errorSignUp) {
                    this.errorSignUp.innerText = 'Ошибка при подключении к серверу. Проверьте соединение.';
                }
            });
        });

    }

    private async signUp(): Promise<void> {
        if (!this.errorSignUp || !this.signUpBtn) {
            return;
        }

        FormUtils.resetValidationErrors(this.inputsElement, this.errorSignUp);

        const data: DataValidationType | null = Validation.validForm(this.inputsElement);
        if (
            !data?.nameInputElement ||
            !data.lastNameInputElement ||
            !data.emailInputElement ||
            !data.passwordInputElement ||
            !data.passwordReplaceInputElement
        ) {
            this.errorSignUp.innerText = 'Не верно введены данные';
            return;
        }

        this.signUpBtn.disabled = true;

        try {
            const result = await Response.getElementsFromBackend<SignUpResultResponse | ErrorResultResponse>(
                'POST',
                '/signup',
                null,
                {
                    name: data.nameInputElement,
                    lastName: data.lastNameInputElement,
                    email: data.emailInputElement,
                    password: data.passwordInputElement,
                    passwordRepeat: data.passwordReplaceInputElement,
                }
            );

            if ('error' in result && result.error) {
                this.errorSignUp.innerText = result.message;
                return;
            }

            if (!('user' in result)) {
                this.errorSignUp.innerText = 'Сервер вернул некорректный ответ';
                return;
            }

            const loginResult = await AuthTokens.login(result.user.email, data.passwordInputElement, false);
            if ('error' in loginResult && loginResult.error) {
                this.errorSignUp.innerText = 'Регистрация выполнена, но автоматический вход не удался. Войдите вручную.';
                return;
            }

            await this.openNewRouteAutomatic('/');
        } finally {
            this.signUpBtn.disabled = false;
        }
    }
}

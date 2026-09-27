import {Validation} from "../utils/validation";
import {config} from "../../config/config";
import {AuthTokens} from "../utils/auth-utils";
import {ErrorResultResponse, SignUpResultResponse} from "../../types/result-response.type";
import {DataValidationType} from "../../types/validation.type";
import {FormUtils} from "../utils/reset-validation";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class SignUp {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly inputsElement: NodeListOf<HTMLInputElement>;
    readonly errorSignUp: HTMLElement | null;
    readonly signUpBtn: HTMLElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.inputsElement = document.querySelectorAll('.form-floating input');
        this.errorSignUp = document.getElementById('error-singUp');
        this.signUpBtn = document.getElementById('singUpBtn');

        this.signUpBtn?.addEventListener('click', () => {
            this.signUp().catch((error) => {
                console.error('Sign-up error:', error);
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

        this.signUpBtn.setAttribute('disabled', 'disabled');

        try {
            const response = await fetch(config.api + '/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: data.nameInputElement,
                    lastName: data.lastNameInputElement,
                    email: data.emailInputElement,
                    password: data.passwordInputElement,
                    passwordRepeat: data.passwordReplaceInputElement,
                }),
            });

            const result: SignUpResultResponse | ErrorResultResponse = await response.json();

            if (!response.ok || !('user' in result)) {
                this.errorSignUp.innerText = 'message' in result
                    ? result.message
                    : `Ошибка сервера: ${response.status}`;
                return;
            }

            const loginResult = await AuthTokens.login(
                result.user.email,
                data.passwordInputElement,
                false
            );

            if ('error' in loginResult && loginResult.error) {
                this.errorSignUp.innerText = 'Регистрация выполнена, но автоматический вход не удался. Войдите вручную.';
                return;
            }

            await this.openNewRouteAutomatic('/');
        } catch (error) {
            console.error('Sign-up request failed:', error);
            this.errorSignUp.innerText = 'Ошибка соединения с сервером';
        } finally {
            this.signUpBtn.removeAttribute('disabled');
        }
    }
}

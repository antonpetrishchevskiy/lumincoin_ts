import {DataValidationType} from "../../types/validation.type";

export class Validation {
    public static validForm(
        inputsElement: NodeListOf<HTMLInputElement>,
        password = ''
    ): DataValidationType | null {
        const data: DataValidationType = {
            nameInputElement: null,
            lastNameInputElement: null,
            emailInputElement: null,
            passwordInputElement: null,
            passwordReplaceInputElement: null,
            rememberMeInputElement: null,
        };

        let isValid = true;
        let primaryPassword = password;

        inputsElement.forEach((input) => {
            if (!input.value.trim()) {
                this.setInputState(input, false);
                isValid = false;
                return;
            }

            switch (input.type) {
                case 'text':
                    if (!/^[A-Za-zА-ЯЁа-яё]{2,}$/.test(input.value.trim())) {
                        this.setInputState(input, false);
                        isValid = false;
                        return;
                    }

                    this.setInputState(input, true);

                    if (input.name === 'name') {
                        data.nameInputElement = input.value.trim();
                    } else if (input.name === 'lastName') {
                        data.lastNameInputElement = input.value.trim();
                    }
                    break;

                case 'email':
                    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/.test(input.value.trim())) {
                        this.setInputState(input, false);
                        isValid = false;
                        return;
                    }

                    this.setInputState(input, true);
                    data.emailInputElement = input.value.trim();
                    break;

                case 'password':
                    if (!primaryPassword) {
                        if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(input.value)) {
                            this.setInputState(input, false);
                            isValid = false;
                            return;
                        }

                        primaryPassword = input.value;
                        data.passwordInputElement = input.value;
                        this.setInputState(input, true);
                        break;
                    }

                    if (input.value !== primaryPassword) {
                        this.setInputState(input, false);
                        isValid = false;
                        return;
                    }

                    data.passwordReplaceInputElement = input.value;
                    this.setInputState(input, true);
                    break;

                default:
                    this.setInputState(input, true);
            }
        });

        if (!isValid) {
            return null;
        }

        return data;
    }

    static validationGenerals(
        selects: NodeListOf<HTMLElement> | null,
        amount: HTMLElement | null,
        data: HTMLElement | null,
        comment: HTMLElement | null
    ): boolean {
        let isValid = true;

        selects?.forEach((select) => {
            const valid = Boolean((select as HTMLSelectElement).value);
            this.setGeneralFieldState(select, valid);
            isValid = valid && isValid;
        });

        if (amount) {
            const valid = Boolean((amount as HTMLInputElement).value);
            this.setGeneralFieldState(amount, valid);
            isValid = valid && isValid;
        }

        if (data) {
            const valid = /^\d{4}-\d{2}-\d{2}$/.test((data as HTMLInputElement).value);
            this.setGeneralFieldState(data, valid);
            isValid = valid && isValid;
        }

        if (comment) {
            const valid = Boolean((comment as HTMLInputElement).value.trim());
            this.setGeneralFieldState(comment, valid);
            isValid = valid && isValid;
        }

        return isValid;
    }

    private static setInputState(input: HTMLInputElement, valid: boolean): void {
        const icon = input.closest('.form-floating')?.previousElementSibling as HTMLElement | null;
        const error = input.closest('.input-block')?.nextElementSibling as HTMLElement | null;

        input.classList.toggle('invalid', !valid);
        icon?.classList.toggle('invalid', !valid);
        error?.classList.toggle('invalid', !valid);
    }

    private static setGeneralFieldState(element: HTMLElement, valid: boolean): void {
        const error = element.nextElementSibling as HTMLElement | null;

        element.classList.toggle('invalid', !valid);

        if (error) {
            error.style.display = valid ? 'none' : 'block';
        }
    }
}

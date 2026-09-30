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
                        if (!/^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\p{N})(?=.*[^\p{L}\p{N}]).{8,}$/u.test(input.value)) {
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

        return isValid ? data : null;
    }

    static validationGenerals(
        selects: NodeListOf<HTMLSelectElement> | null,
        amount: HTMLInputElement | null,
        data: HTMLInputElement | null,
        comment: HTMLInputElement | null
    ): boolean {
        let isValid = true;

        selects?.forEach((select) => {
            const valid = Boolean(select.value);
            this.setGeneralFieldState(select, valid);
            isValid = valid && isValid;
        });

        if (amount) {
            const value = Number(amount.value);
            const valid = Number.isFinite(value) && value > 0;
            this.setGeneralFieldState(amount, valid);
            isValid = valid && isValid;
        }

        if (data) {
            const valid = this.isValidDate(data.value);
            this.setGeneralFieldState(data, valid);
            isValid = valid && isValid;
        }

        if (comment) {
            const valid = Boolean(comment.value.trim());
            this.setGeneralFieldState(comment, valid);
            isValid = valid && isValid;
        }

        return isValid;
    }

    private static isValidDate(value: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day;
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

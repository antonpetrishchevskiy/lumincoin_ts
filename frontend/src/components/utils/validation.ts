import {DataValidationType} from "../../types/validation.type";

export class Validation {

    public static validForm(inputsElement: NodeListOf<HTMLInputElement>, password: string = '') {
        let isValid: boolean = true;
        const date: DataValidationType = {
            nameInputElement: null,
            lastNameInputElement: null,
            emailInputElement: null,
            passwordInputElement: null,
            passwordReplaceInputElement: null,
            rememberMeInputElement: null,
        }
        inputsElement.forEach((inputElement: HTMLInputElement) => {
            const parentInputElement: HTMLElement | null = inputElement.closest('.input-block');
            const iconInputElementFormFloating: HTMLElement | null = inputElement.closest('.form-floating');
            if (iconInputElementFormFloating) {
                const iconInputElement = iconInputElementFormFloating.previousElementSibling as HTMLElement | null;
                isValid = true;

                if (iconInputElement) {
                    if (inputElement.value !== '') {
                        if (inputElement.type === 'text') {
                            // Разрешаем только буквы (латиницу или кириллицу), минимум 2 символа
                            if (inputElement.value.match(/^[A-Za-zА-ЯЁа-яё]{2,}$/)) {
                                // Сохраняем значение в соответствующее поле в зависимости от атрибута name
                                if (inputElement.name === 'name') {
                                    date.nameInputElement = inputElement.value;
                                } else if (inputElement.name === 'lastName') {
                                    date.lastNameInputElement = inputElement.value;
                                }
                                inputElement.classList.remove('invalid');
                                iconInputElement.classList.remove('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.remove('invalid');
                                    }
                                }
                            } else {
                                inputElement.classList.add('invalid');
                                iconInputElement.classList.add('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.add('invalid');
                                    }
                                }
                                isValid = false;
                            }
                        }
                        if (inputElement.type === 'email') {
                            if (inputElement.value && inputElement.value.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/)) {
                                date.emailInputElement = inputElement.value;
                                inputElement.classList.remove('invalid');
                                iconInputElement.classList.remove('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.remove('invalid');
                                    }
                                }
                            } else {
                                inputElement.classList.add('invalid');
                                iconInputElement.classList.add('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.add('invalid');
                                    }
                                }
                                isValid = false;
                            }
                        } else if (inputElement.type !== 'text') {
                            inputElement.classList.remove('invalid');
                            iconInputElement.classList.remove('invalid');
                            if (parentInputElement) {
                                const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                if (parentElementNext) {
                                    parentElementNext.classList.remove('invalid');
                                }
                            }
                        }
                        if (inputElement.type === 'password') {
                            if (inputElement.value.match(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/) && password === '') {
                                date.passwordInputElement = inputElement.value;
                                inputElement.classList.remove('invalid');
                                iconInputElement.classList.remove('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.remove('invalid');
                                    }
                                }
                                password = inputElement.value;
                            } else if (password !== '' && inputElement.value === password) {
                                date.passwordReplaceInputElement = inputElement.value;
                                inputElement.classList.remove('invalid');
                                iconInputElement.classList.remove('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.remove('invalid');
                                    }
                                }
                            } else {
                                inputElement.classList.add('invalid');
                                iconInputElement.classList.add('invalid');
                                if (parentInputElement) {
                                    const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                                    if (parentElementNext) {
                                        parentElementNext.classList.add('invalid');
                                    }
                                }
                                isValid = false;
                            }
                        }
                    } else {
                        inputElement.classList.add('invalid');
                        iconInputElement.classList.add('invalid');

                        if (parentInputElement) {
                            const parentElementNext = parentInputElement.nextElementSibling as HTMLElement | null;
                            if (parentElementNext) {
                                parentElementNext.classList.add('invalid');
                            }
                        }
                        isValid = false;
                    }
                }
            }
        })

        if (isValid) {
            return date;
        }
        return null;
    }

    static validationGenerals(selects: NodeListOf<HTMLElement> | null, amount: HTMLElement | null, data: HTMLElement | null, comment: HTMLElement | null) {
        const selectsElement = selects;
        const amountElement = amount;
        const dataElement = data;
        const commentElement = comment;

        let isError = true;

        if (selectsElement) {
            selectsElement.forEach(select => {
                if ((select as HTMLSelectElement).value === '') {
                    const nextSelectElement = select.nextElementSibling as HTMLElement | null;
                    if (nextSelectElement) {
                        nextSelectElement.style.display = 'block';
                        select.classList.add('invalid');
                        isError = false;
                    }
                } else {
                    const nextSelectElement = select.nextElementSibling as HTMLElement | null;
                    if (nextSelectElement) {
                        nextSelectElement.style.display = 'none';
                        select.classList.remove('invalid');
                    }
                }
            })
        }

        if (amountElement && (amountElement as HTMLInputElement).value === '') {
            const nextAmountElement = amountElement.nextElementSibling as HTMLElement | null;
            if (nextAmountElement) {
                (nextAmountElement as HTMLElement).style.display = 'block';
                amountElement.classList.add('invalid');
                isError = false;
            }
        } else {
            if (amountElement) {
                const nextAmountElement = amountElement.nextElementSibling as HTMLElement | null;
                if (nextAmountElement) {
                    (nextAmountElement as HTMLElement).style.display = 'none';
                    amountElement.classList.remove('invalid');
                }
            }
        }
        if (dataElement && ((dataElement as HTMLInputElement).value === '' || !/^\d{4}-\d{2}-\d{2}$/.test((dataElement as HTMLInputElement).value))) {
            const nextDataElement = dataElement.nextElementSibling as HTMLElement | null;
            if (nextDataElement) {
                (nextDataElement as HTMLInputElement).style.display = 'block';
                dataElement.classList.add('invalid');
                isError = false;
            }
        } else if (dataElement) {
            const nextDataElement = dataElement.nextElementSibling as HTMLElement | null;
            if (nextDataElement) {
                (nextDataElement as HTMLInputElement).style.display = 'none';
                dataElement.classList.remove('invalid');
            }
        }

        if (commentElement && (commentElement as HTMLInputElement).value === '') {
            const nextDataElement = commentElement.nextElementSibling as HTMLElement | null;
            if (nextDataElement) {
                nextDataElement.style.display = 'block';
                commentElement.classList.add('invalid');
                isError = false;
            }
        } else if (commentElement) {
            const nextDataElement = commentElement.nextElementSibling as HTMLElement | null;
            if (nextDataElement) {
                nextDataElement.style.display = 'none';
                commentElement.classList.remove('invalid');
            }
        }
        return isError;
    }
}
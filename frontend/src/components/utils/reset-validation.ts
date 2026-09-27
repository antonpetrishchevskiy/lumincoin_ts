export class FormUtils {
    static resetValidationErrors(inputsElement: any, errorElement: HTMLElement | null): void {
        if (errorElement) {
            errorElement.innerText = '';
        }

        inputsElement.forEach((input: HTMLElement) => {
            const parentInputElement = input.closest('.input-block');
            const iconInputElement = input.closest('.form-floating')?.previousElementSibling;

            input.classList.remove('invalid');
            if (iconInputElement) {
                iconInputElement.classList.remove('invalid');
            }
            if (parentInputElement && parentInputElement.nextElementSibling) {
                parentInputElement.nextElementSibling.classList.remove('invalid');
            }
        });
    }
}
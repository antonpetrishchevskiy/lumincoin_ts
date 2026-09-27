export class FormUtils {
    static resetValidationErrors(
        inputsElement: NodeListOf<HTMLInputElement>,
        errorElement: HTMLElement | null
    ): void {
        if (errorElement) {
            errorElement.textContent = '';
        }

        inputsElement.forEach(input => {
            const parentInputElement = input.closest('.input-block');
            const iconInputElement = input.closest('.form-floating')?.previousElementSibling;

            input.classList.remove('invalid');
            iconInputElement?.classList.remove('invalid');
            parentInputElement?.nextElementSibling?.classList.remove('invalid');
        });
    }
}

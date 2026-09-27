export class Layout {
    readonly burger: HTMLElement | null;
    readonly slider: HTMLElement | null;
    readonly layoutLinks: HTMLElement | null;

    constructor() {
        this.burger = document.getElementById("burger");
        this.slider = document.getElementById("slider");
        this.layoutLinks = document.getElementById('layoutLinks');

        const categories = this.layoutLinks?.querySelectorAll('details');
        categories?.forEach(details => {
            details.addEventListener('mouseenter', () => {
                details.open = true;
            });

            details.addEventListener('mouseleave', () => {
                details.open = false;
            });

            const summary = details.querySelector('summary');
            summary?.addEventListener('click', event => {
                event.preventDefault();
            });
        });

        if(this.burger) {
            this.burger.onclick = this.clickBurger.bind(this);
        }
    }

    private clickBurger(): void {
        if(this.slider) {
            if (this.slider.classList.contains('close')) {
                this.slider.classList.remove('close');
            } else {
                this.slider.classList.add('close');
            }
        }
    }
}

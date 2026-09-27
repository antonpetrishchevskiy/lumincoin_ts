export class Layout {
    readonly burger: HTMLElement | null;
    readonly slider: HTMLElement | null;
    readonly layoutLinks: HTMLElement | null;
    readonly elementsLi: NodeListOf<HTMLAnchorElement> | undefined;

    constructor() {
        this.burger = document.getElementById("burger");
        this.slider = document.getElementById("slider");
        this.layoutLinks = document.getElementById('layoutLinks');
        if(this.layoutLinks) {
            this.elementsLi = this.layoutLinks.querySelectorAll('a');
        }
        if(this.elementsLi) {
            this.elementsLi.forEach(el => {
                if (el.pathname === location.pathname) {
                    if (location.pathname === '/incomes' || location.pathname === '/expenses') {
                        const elementDetails = el.closest('details') as HTMLElement | null;
                        if(elementDetails) {
                            elementDetails.classList.add('checked');
                        }
                        const elementLi = el.closest('li') as HTMLElement | null;
                        if(elementLi) {
                            elementLi.classList.add('checked-category');
                        }
                    } else {
                        const elementLi = el.closest('li') as HTMLElement | null;
                        if(elementLi) {
                            elementLi.classList.add('checked');
                        }
                    }
                }
            })
        }

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
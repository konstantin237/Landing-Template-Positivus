// Класс меню бургера
export class MenuToggler {
    
    constructor(data) {
        this.type = data.type ?? 'appear';
        this.transitionTime = data.transitionTime ?? '.25s';
        this.transitionType = data.transitionType ?? '.ease';
        this.menuDisplay = data.menuDisplay ?? 'block';
        this.slideBegin = data.slideBegin ?? 'translate(-100%, 0px)';
        this.slideEnd = data.slideEnd ?? 'translate(0px, 0px)';
        this.menuTriggerSelector = data.menuTriggerSelector;
        this.menuSelector = data.menuSelector;

        this.menuTrigger = document.querySelector(this.menuTriggerSelector);
        this.menu = document.querySelector(this.menuSelector);

        this.isChanging = false;
        this.state = 'hide';

        this.init();
    }

    init() {
        this.menuTrigger.addEventListener('click', this.toggle.bind(this));

        if (this.type === 'appear') {
            this.menu.style.opacity = 0;
            this.menu.style.display = 'none';

            this.menu.addEventListener('transitionend', (e) => {
                if (e.target === this.menu) {
                    this.isChanging = false;
                    if (this.state === 'hide') {
                        this.menu.style.display = 'none';
                    }
                }
            });
        }

        if (this.type === 'slide') {
            document.body.style.overflowX = 'hidden';
            this.setVendorStyleProperty(this.menu, 'transform', this.slideBegin);
            setTimeout(() => {
                this.setVendorStyleProperty(this.menu, 'transition', `transform ${this.transitionTime} ${this.transitionType}`);
            }, 1);
        }
    }

    setVendorStyleProperty(element, property, value) {
        const prefixes = ['webkit', 'moz', 'ms', 'o'];
        for (const prefix of prefixes) {
            element.style[`${prefix}${property}`] = value;
        }
        element.style[property] = value;
    }

    toggle() {
        if (this.type === 'appear' && !this.isChanging) {
            if (this.menu.style.opacity === '1') {
                this.setVendorStyleProperty(this.menu, 'transition', `opacity ${this.transitionTime} ${this.transitionType}`);
                if (this.menuTrigger.classList.contains('burger')) {
                    this.menuTrigger.classList.remove('burger_close');
                }
                this.state = 'hide';
                this.menu.style.opacity = '0';
                this.isChanging = true;
                return;
            }

            if (this.menu.style.opacity === '0') {
                if (this.menuTrigger.classList.contains('burger')) {
                    this.menuTrigger.classList.add('burger_close');
                }
                this.state = 'show';
                this.menu.style.display = this.menuDisplay;
                setTimeout(() => {
                    this.setVendorStyleProperty(this.menu, 'transition', `opacity ${this.transitionTime} ${this.transitionType}`);
                    this.menu.style.height = 'initial';
                    this.menu.style.opacity = '1';
                    this.isChanging = true;
                }, 1);
                return;
            }
        }

        if (this.type === 'slide' && !this.isChanging) {
            const isAtStart = this.menu.style.transform === this.slideBegin;

            if (isAtStart) {
                if (this.menuTrigger.classList.contains('burger')) {
                    this.menuTrigger.classList.add('burger_close');
                }
                this.setVendorStyleProperty(this.menu, 'transform', this.slideEnd);
                this.menu.style.transform = this.slideEnd;
            } else {
                if (this.menuTrigger.classList.contains('burger')) {
                    this.menuTrigger.classList.remove('burger_close');
                }
                this.setVendorStyleProperty(this.menu, 'transform', this.slideBegin);
                this.menu.style.transform = this.slideBegin;
            }
        }
    }
}

import "./menu.scss";

interface IMenuItem {
    id: string;
    caption: string;
    click: () => void;
}

export class Menu {
    private overlay: HTMLElement;
    private element: HTMLElement;

    constructor (private items: IMenuItem[]) { }

    public show (left: number, top: number) {
        this.showMenu();
        this.setMenuPosition(left, top);
    }

    public hide () {
        this.overlay?.parentNode?.removeChild(this.overlay);
        this.element?.parentNode?.removeChild(this.element);
    }

    private showMenu () {
        const html = `
            <div id="menu-overlay"></div>
            <div id="menu">
                ${this.items.map((x) => `
                    <div class="menu-item" id="${x.id}">${x.caption}</div>
                `).join("")}
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", html);
        this.element = document.getElementById("menu");
        this.overlay = document.getElementById("menu-overlay");

        this.overlay.onclick = () => this.hide();

        for (const item of this.items) {
            const element = this.element.querySelector(`div#${item.id}`) as HTMLElement;
            element.onclick = () => {
                this.hide();
                item.click();
            };
        }
    }

    private setMenuPosition (left: number, top: number) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const scrollLeft = window.scrollX;
        const scrollTop = window.scrollY;

        const menuWidth = this.element.clientWidth;
        const menuHeight = this.element.clientWidth;

        const newLeft = (left - scrollLeft + menuWidth > viewportWidth) ? left - menuWidth : left;
        const newTop = (top - scrollTop + menuHeight > viewportHeight) ? top - menuHeight : top;

        this.element.style.left = `${newLeft}px`;
        this.element.style.top = `${newTop}px`;
    }
}

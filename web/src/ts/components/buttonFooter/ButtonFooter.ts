import template from "./button-footer.hbs";
import "./button-footer.scss";

interface IButton {
    id: string;
    caption: string;
    type?: "delete" | "submit";
    click: () => void;
}

export class ButtonFooter {
    public target: HTMLElement;

    private element: HTMLDivElement;
    private buttons: IButton[] = [];

    constructor () {
        this.element = document.createElement("div");
        this.element.classList.add("buttons", "hidden");
    }

    public show (target?: HTMLElement) {
        if (target) {
            if (this.element?.parentNode) this.element.parentNode.removeChild(this.element);
            this.target = target;
        }
        if (!this.element.parentNode) {
            this.target.appendChild(this.element);
            this.target.classList.add("with-buttons");
        }

        this.element.classList.remove("hidden");
        this.render();
    }

    public hide () {
        this.element.classList.add("hidden");
        if (this.target) {
            this.target.classList.remove("with-buttons");
        }
    }

    public addButton (button: IButton) {
        this.removeButton(button.id);
        this.buttons.push(button);
        this.render();
    }

    public removeButton (id: string) {
        this.buttons = this.buttons.filter(x => x.id !== id);
        this.render();
    }

    private render () {
        this.element.innerHTML = template({
            buttons: this.buttons
        });

        for (const button of this.buttons) {
            const el: HTMLButtonElement = this.element.querySelector(`#${button.id}`);
            el.onclick = () => button.click();
        }
    }
}
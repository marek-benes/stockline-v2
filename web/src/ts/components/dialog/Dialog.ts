import template from "./dialog.hbs";
import "./dialog.scss";

import { IView } from "../../models/IView";
import { Icons } from "../icons/Icons";

interface IDialogOptions {
    title: string;
    closable?: boolean;
    overlay?: boolean;
    search?: boolean;
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    functions?: Array<{
        id: string;
        title: string;
        icon: string;
        click: (e: MouseEvent) => void
    }>;
    buttons?: Array<{
        id: string;
        caption: string;
        type?: "default" | "submit" | "delete";
        click: (e: MouseEvent) => void
    }>;
}

export class Dialog implements IView {
    public onClose: () => void;
    public onSearch: (text: string) => void;

    protected wrapper: HTMLElement;
    protected dialog: HTMLElement;
    protected loading: boolean;

    constructor (public readonly id: string, private options: IDialogOptions) {}

    public show () {
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("dialog-wrapper");
        if (this.options.overlay) {
            this.wrapper.classList.add("dialog-overlay");
        }
        document.body.appendChild(this.wrapper);
        this.wrapper.innerHTML = template({
            id: this.id,
            title: this.options.title,
            funtions: this.options.functions,
            buttons: this.options.buttons,
            closable: this.options.closable,
            search: this.options.search,
            searchIcon: Icons.Search,
            closeIcon: Icons.Close
        });
        this.dialog = this.wrapper.querySelector("div.dialog");

        if (this.options.width) { this.dialog.style.width = this.options.width; }
        if (this.options.height) { this.dialog.style.height = this.options.height; }
        if (this.options.minWidth) { this.dialog.style.minWidth = this.options.minWidth; }
        if (this.options.minHeight) { this.dialog.style.minHeight = this.options.minHeight; }

        if (this.options.search) {
            const input = this.dialog.querySelector(`div.search input`) as HTMLInputElement;
            input.onkeyup = () => this.onSearch ? this.onSearch(input.value) : undefined;
        }

        for (const fn of this.options.functions ?? []) {
            const div = this.dialog.querySelector(`div.functions div#${fn.id}`) as HTMLElement;
            div.onclick = (e) => fn.click(e);
        }

        for (const btn of this.options.buttons ?? []) {
            const button = this.dialog.querySelector(`div.buttons button#${btn.id}`) as HTMLElement;
            button.onclick = (e) => btn.click(e);
        }

        if (this.options.closable) {
            const close = this.dialog.querySelector(`div.functions div#close`) as HTMLElement;
            close.onclick = () => {
                if (this.onClose) { this.onClose(); }
                this.hide();
            };
        }

        this.wrapper.onclick = (e) => {
            const element = e.target as HTMLElement;
            if (element.classList.contains("dialog-wrapper")) {
                this.hide();
            }
        };
    }

    public hide () {
        this.wrapper.parentNode.removeChild(this.wrapper);
    }

    public showLoader () {
        this.dialog.classList.add("loader");
        this.loading = true;
    }
    public hideLoader () {
        this.dialog.classList.remove("loader");
        this.loading = false;
    }
}

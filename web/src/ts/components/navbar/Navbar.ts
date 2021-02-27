import template from "./navbar.hbs";
import "./navbar.scss";

import { AppContext } from "../../AppContext";
import { IView } from "../../models/IView";
import { Icons } from "../icons/Icons";

export class Navbar implements IView {
    public readonly id = "navbar";

    public title: string = "";

    private element: HTMLDivElement;

    constructor (private readonly context: AppContext) {
        this.element = document.createElement("div");
        this.element.id = this.id;
    }

    public show (target: HTMLElement) {
        target.appendChild(this.element);
        this.element.innerHTML = template({
            title: this.title,
            icons: Icons
        });

        this.element.querySelectorAll("div#navbar div.function").forEach((x: HTMLDivElement) => {
            x.onclick = () => {
                console.log(x);
            };
        });

        this.showButton();
    }

    public hide () {
        this.element?.parentNode?.removeChild(this.element);
    }

    public showButton (type: "hamburger" | "back" = "hamburger", route?: string) {
        const hamburger = this.element.querySelector("div.hamburger") as HTMLDivElement;
        const back = this.element.querySelector("div.back") as HTMLDivElement;

        if (type === "back") {
            hamburger.style.display = "none";
            back.style.display = "";
        } else {
            back.style.display = "none";
            hamburger.style.display = "";
        }

        hamburger.onclick = () => {
            document.dispatchEvent(new CustomEvent("toggle-sidebar"));
        };

        back.onclick = () => {
            if (route) {
                this.context.router.navigate(route);
            } else {
                document.dispatchEvent(new CustomEvent("previous-screen"));
            }
        };
    }

    public showSearch (callback: (text: string) => void) {
        this.element.querySelector("div.nav-right").insertAdjacentHTML("afterbegin", `
            <div class="search">
                <input type="text" placeholder="Hledat"/>
                <div class="material-icons">${Icons.Search}</div>
            </div>
        `);
        const input = this.element.querySelector(`div.search input`) as HTMLInputElement;
        input.onkeyup = () => callback(input.value);
    }

    public addFunction (id: string, title: string, icon: string, callback: (e: MouseEvent) => void) {
        this.element.querySelector("div.nav-right").insertAdjacentHTML("beforeend", `
            <div id="${id}" class="function material-icons" title="${title}">${icon}</div>
        `);
        const div = this.element.querySelector(`div#${id}`) as HTMLElement;
        div.onclick = (e) => callback(e);
    }

    public showLoader () {
        this.element.classList.add("loading");
    }

    public hideLoader () {
        this.element.classList.remove("loading");
    }
}

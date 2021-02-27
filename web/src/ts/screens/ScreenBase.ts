import { AppContext } from "../AppContext";
import { ButtonFooter } from "../components/buttonFooter/ButtonFooter";
import { Navbar } from "../components/navbar/Navbar";
import { IView } from "../models/IView";

export abstract class ScreenBase implements IView {
    public abstract readonly id: string;
    public abstract readonly title: string;

    protected target: HTMLDivElement;
    protected content: HTMLDivElement;
    protected readonly navbar: Navbar;
    protected readonly buttons: ButtonFooter;

    constructor (protected readonly context: AppContext) {
        this.navbar = new Navbar(this.context);

        this.buttons = new ButtonFooter();

        this.content = document.createElement("div");
        this.content.classList.add("content");
    }

    public show () {
        this.target = document.getElementById("main") as HTMLDivElement;
        this.target.classList.add(this.id);
        this.target.innerHTML = "";

        this.navbar.title = this.title;
        this.navbar.show(this.target);

        this.buttons.target = this.target;

        this.target.appendChild(this.content);
        this.content.id = this.id;

        document.querySelector("#sidebar a.selected")?.classList.remove("selected");

        // const link = document.querySelector(`a#link-${this.id.replace("-detail", "")}`);
        const screen = this.context.router.current.split("/").filter(x => x.length)[0];
        const link = document.querySelector(`a#link-screen-${screen}`);
        link?.classList.add("selected");

        const section = link?.parentNode?.parentNode as HTMLElement;
        if (section?.classList.contains("section")) {
            link?.parentNode?.parentNode?.querySelector("input").setAttribute("checked", "checked");
        }
    }

    public hide () {
        this.buttons.hide();

        this.target.classList.remove(this.id);
        this.target.innerHTML = "";

        this.content.id = undefined;
        this.content.innerHTML = "";
    }
}

import template from "./login.hbs";
import "./login.scss";

import { AuthClient } from "../../data/clients/AuthClient";

export class Login {
    public onLogin: () => void;

    private element: HTMLDivElement;
    private usernameInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private alert: HTMLDivElement;
    private button: HTMLButtonElement;

    constructor (private authClient: AuthClient) { }

    public show () {
        document.body.insertAdjacentHTML("afterbegin", template());

        this.element = document.getElementById("login") as HTMLDivElement;
        this.usernameInput = document.getElementById("username") as HTMLInputElement;
        this.passwordInput = document.getElementById("password") as HTMLInputElement;
        this.alert = document.querySelector("div.alert") as HTMLDivElement;
        this.button = document.getElementById("button-login") as HTMLButtonElement;

        this.usernameInput.value = localStorage.getItem("stockline.username") ?? "";
        if (this.usernameInput.value.length === 0) {
            this.usernameInput.focus();
        } else {
            this.passwordInput.focus();
        }

        const submit = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.code === "Enter") {
                this.button.click();
            }
        };
        this.usernameInput.onkeypress = submit;
        this.passwordInput.onkeypress = submit;

        this.button.onclick = () => {
            if (!this.passwordInput.value?.length) {
                this.passwordInput.focus();
                return;
            }
            this.login(this.usernameInput.value, this.passwordInput.value);
        };
    }

    public hide () {
        if (this.element) {
            this.element.parentNode?.removeChild(this.element);
        }
    }

    private async login (username: string, password: string) {
        const userInfo = await this.authClient.login(username, password);
        if (userInfo) {
            localStorage.setItem("stockline.username", username);
            this.hide();
            if (this.onLogin) { this.onLogin(); }
        } else {
            this.alert.innerHTML = "Neplatné jméno nebo heslo";
            this.passwordInput.value = "";
        }
    }
}

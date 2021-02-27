import { Dialog } from "../dialog/Dialog";

interface IAlertOption {
    title?: string;
    text: string;
    caption?: string;
    type?: "submit" | "delete";
    result?: (result: boolean) => void;
}

export class Alert extends Dialog {

    constructor (private confirmOptions: IAlertOption) {
        super("dialog-alert", {
            title: confirmOptions.title ?? "Potrvrdit",
            overlay: true,
            buttons: [
                { id: "button-submit", caption: confirmOptions.caption ?? "OK", type: confirmOptions.type ?? "submit", click: () => this.confirm(true)}
            ]
        });
    }

    public async show () {
        super.show();
        const content = this.dialog.querySelector("div.content") as HTMLElement;
        content.innerHTML = this.confirmOptions.text;
    }

    private confirm (result: boolean) {
        this.hide();
        if (this.confirmOptions.result) {
            this.confirmOptions.result(result);
        }
    }
}

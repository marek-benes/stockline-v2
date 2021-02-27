import { Dialog } from "../dialog/Dialog";

interface IConfirmOptions {
    title?: string;
    text: string;
    caption?: string;
    type?: "submit" | "delete";
    result: (result: boolean) => void;
}

export class Confirm extends Dialog {

    constructor (private confirmOptions: IConfirmOptions) {
        super("dialog-confirm", {
            title: confirmOptions.title ?? "Potrvrdit",
            overlay: true,
            buttons: [
                { id: "button-cancel", caption: "Zrušit", click: () => this.confirm(false) },
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
        this.confirmOptions.result(result);
    }
}

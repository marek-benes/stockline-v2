import "./unknown-screen.scss";

import { AppContext } from "../../../AppContext";
import { ScreenBase } from "../../ScreenBase";

export class UnknownScreen extends ScreenBase {
    public readonly id = "screen-unknown";
    public readonly title = "404";

    constructor (context: AppContext) {
        super(context);

    }

    public show () {
        super.show();

        this.navbar.title = this.title;
        this.content.innerHTML = "404 Stránka nenalezena";

        return this;
    }
}

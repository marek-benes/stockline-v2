import { ScreenBase } from "../../ScreenBase";

export class DashboardScreen extends ScreenBase {
    public readonly id = "screen-dashboard";
    public readonly title = "Dashboard";

    public show () {
        super.show();

        return this;
    }
}

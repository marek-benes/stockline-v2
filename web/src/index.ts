import { HttpClient } from "ts/data/clients/HttpClient";
import { IApi } from "ts/models/IApi";
import "./scss/index.scss";

import { App } from "./ts/App";
import { Login } from "./ts/components/login/Login";
import { AuthClient } from "./ts/data/clients/AuthClient";

async function getConfig (): Promise<{ api: IApi; }> {
    const http = new HttpClient();
    const data: any = http.get("./stockline.json", {});
    return data;
}

async function bootstrap () {
    const config = await getConfig();

    const authClient = new AuthClient(config.api);

    // const token = AuthClient.getStoredToken();
    const authUser = await authClient.isLoggedIn();

    if (authUser) {
        new App(config.api);
    } else {
        const login = new Login(authClient);
        login.onLogin = () => new App(config.api);
        login.show();
    }
}

// start
bootstrap();

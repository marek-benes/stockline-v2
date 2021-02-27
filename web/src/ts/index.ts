import "../scss/index.scss";

import { App } from "./App";
import { Login } from "./components/login/Login";
import { AuthClient } from "./data/clients/AuthClient";

const api = "http://localhost:5000";

async function bootstrap () {
    const authClient = new AuthClient(api);

    // const token = AuthClient.getStoredToken();
    const authUser = await authClient.isLoggedIn();

    if (authUser) {
        new App(api);
    } else {
        const login = new Login(authClient);
        login.onLogin = () => new App(api);
        login.show();
    }
}

// start
bootstrap();

import "./scss/index.scss";

import { App } from "./ts/App";
import { Login } from "./ts/components/login/Login";
import { AuthClient } from "./ts/data/clients/AuthClient";

// this does not seem right
// const Handlebars = require("handlebars/dist/handlebars");
// console.log(Handlebars);

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

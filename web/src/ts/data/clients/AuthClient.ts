import { IApi } from "ts/models/IApi";
import { IUser } from "../../models/api/IUser";
import { HttpClient } from "./HttpClient";

const STORAGE_KEY = "stockline.auth";

export class AuthClient {
    public static getStoredUserInfo (): IUser {
        const serializedUserInfo = window.localStorage.getItem(STORAGE_KEY);

        let userInfo: IUser;
        try {
            userInfo = JSON.parse(serializedUserInfo);
        } catch (err) {
            console.error("AuthClient", "Error while parsing stored user info", err);
        }

        return userInfo;
    }

    public static getStoredToken () {
        let token: string;

        const userInfo = AuthClient.getStoredUserInfo();

        if (!token && userInfo && userInfo.token) {
            token = userInfo.token;
        }

        return token;
    }

    public static storeUserInfo (userInfo: IUser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
    }

    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    constructor (public readonly api: IApi) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
    }

    public async isLoggedIn (token?: string): Promise<IUser> {
        if (!token) {
            token = AuthClient.getStoredToken();
        }

        const headers = {
            ...this.httpHeaders,
            Authorization: `Basic ${token}`
        };

        const userInfo: IUser = await this.httpClient.get(this.api.stockline + "/auth", headers);
        if (userInfo) {
            userInfo.token = token;
            return userInfo;
        }

        return undefined;
    }

    public async login (username: string, password: string): Promise<IUser> {
        const payload = {
            password,
            username
        };

        const userInfo: IUser = await this.httpClient.post(this.api.stockline + "/auth", payload, this.httpHeaders);
        AuthClient.storeUserInfo(userInfo);

        return userInfo;
    }

    public async logout (): Promise<void> {
        window.localStorage.removeItem(STORAGE_KEY);

        location.reload();
    }
}

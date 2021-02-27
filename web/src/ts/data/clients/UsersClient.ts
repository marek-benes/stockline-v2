import { IDataset } from "../../models/api/IDataset";
import { IStore } from "../../models/api/IStore";
import { IUser } from "../../models/api/IUser";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class UsersClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedUsers: CachedData<IDataset<IUser[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };

    }

    public async getUsers (): Promise<IUser[]> {
        if (!this.cachedUsers) {
            this.cachedUsers = new CachedData(async () => this.httpClient.get<IDataset<IUser[]>>(`/users`, this.httpHeaders));
        }

        const users = await this.cachedUsers.getData();
        return users?.data;
    }
}

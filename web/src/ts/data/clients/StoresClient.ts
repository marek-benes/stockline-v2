import { API } from "ts/models/IApi";
import { IDataset } from "../../models/api/IDataset";
import { IStore } from "../../models/api/IStore";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class StoresClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedStores: CachedData<IDataset<IStore[]>>;

    constructor (private api: API, token: string) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getStores (): Promise<IStore[]> {
        if (!this.cachedStores) {
            this.cachedStores = new CachedData(async () => this.httpClient.get<IDataset<IStore[]>>(this.api.data + `/datasets/stores`, this.httpHeaders));
        }

        const stores = await this.cachedStores.getData();
        return stores.data;
    }

    public async getStore (id: string): Promise<IStore> {
        const stores = await this.httpClient.get<IDataset<IStore[]>>(this.api.data + `/datasets/stores?id=${id}`, this.httpHeaders);
        return stores?.data[0];
    }
}

import { IDataset } from "../../models/api/IDataset";
import { IStore } from "../../models/api/IStore";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class StoresClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedStores: CachedData<IDataset<IStore[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getStores (): Promise<IStore[]> {
        if (!this.cachedStores) {
            this.cachedStores = new CachedData(async () => this.httpClient.get<IDataset<IStore[]>>(`/stores`, this.httpHeaders));
        }

        const stores = await this.cachedStores.getData();
        return stores.data;
    }

    public async getStore (id: string): Promise<IStore> {
        const store = await this.httpClient.get<IStore>(`/stores/${id}`, this.httpHeaders);
        return store;
    }
}

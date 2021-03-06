import { IApi } from "ts/models/IApi";
import { ICustomer, ICustomerRequest } from "../../models/api/ICustomer";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class CustomersClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedCustomers: CachedData<IDataset<ICustomer[]>>;

    constructor (private api: IApi, token: string) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getCustomers (options?: ICustomerRequest): Promise<ICustomer[]> {
        if (!this.cachedCustomers) {
            this.cachedCustomers = new CachedData(async () => this.httpClient.get<IDataset<ICustomer[]>>(this.api.data + `/datasets/customers${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const customers = await this.cachedCustomers.getData();
        return customers.data;
    }

    public async getCustomer (id: string): Promise<ICustomer> {
        const customers = await this.httpClient.get<IDataset<ICustomer[]>>(this.api.data + `/datasets/customers?id=${id}`, this.httpHeaders);
        return customers?.data[0];
    }
}

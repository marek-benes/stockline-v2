import { ICustomer, ICustomerRequest } from "../../models/api/ICustomer";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class CustomersClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedCustomers: CachedData<IDataset<ICustomer[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getCustomers (options?: ICustomerRequest): Promise<ICustomer[]> {
        if (!this.cachedCustomers) {
            this.cachedCustomers = new CachedData(async () => this.httpClient.get<IDataset<ICustomer[]>>(`/customers${this.createQueryString(options)}`, this.httpHeaders));
        }
        const customers = await this.cachedCustomers.getData();
        return customers.data;
    }

    public async getCustomer (id: string): Promise<ICustomer> {
        const customers = await this.getCustomers({ limit: 1000 });
        const customer = customers.filter((x) => x.id === id)[0];
        return customer;
    }

    private createQueryString (options?: object): string {
        if (!options) { return ""; }

        let result = "?";

        result += Object.keys(options).map((key) => {
            const value = options[key];

            if (Array.isArray(value)) {
                return `${key}=${value.join(",")}`;
            } else if (typeof key === "object") {
                return `${key}=${JSON.stringify(value)}`;
            }

            return `${key}=${value}`;
        }).join("&");

        return result;
    }
}

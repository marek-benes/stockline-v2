import { IDataset } from "../../models/api/IDataset";
import { ISupplier, ISupplierRequest } from "../../models/api/ISupplier";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class SuppliersClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedSuppliers: CachedData<IDataset<ISupplier[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getSuppliers (options?: ISupplierRequest): Promise<ISupplier[]> {
        if (!this.cachedSuppliers) {
            this.cachedSuppliers = new CachedData(async () => this.httpClient.get<IDataset<ISupplier[]>>(`/suppliers${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const suppliers = await this.cachedSuppliers.getData();
        return suppliers.data;
    }

    public async getSupplier (id: string): Promise<ISupplier> {
        const supplier = await this.httpClient.get<ISupplier>(`/suppliers/${id}`, this.httpHeaders);
        return supplier;
    }

    public async postSupplier (data: ISupplier): Promise<ISupplier> {
        const supplier = await this.httpClient.post<ISupplier>(`/suppliers`, data, this.httpHeaders);
        return supplier;
    }

    public async putSupplier (data: ISupplier): Promise<ISupplier> {
        const supplier = await this.httpClient.put<ISupplier>(`/suppliers/${data.id}`, data, this.httpHeaders);
        return supplier;
    }

    public async deleteSupplier (id: string): Promise<void> {
        await this.httpClient.delete<ISupplier>(`/suppliers/${id}`, undefined, this.httpHeaders);
    }
}

import { IBrand, IBrandRequest } from "../../models/api/IBrand";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class BrandsClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedBrands: CachedData<IDataset<IBrand[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getBrands (options?: IBrandRequest): Promise<IBrand[]> {
        if (!this.cachedBrands) {
            this.cachedBrands = new CachedData(async () => this.httpClient.get<IDataset<IBrand[]>>(`/brands${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const brands = await this.cachedBrands.getData();
        return brands.data;
    }

    public async getBrand (id: string): Promise<IBrand> {
        const brand = await this.httpClient.get<IBrand>(`/brands/${id}`, this.httpHeaders);
        return brand;
    }

    public async postBrand (data: IBrand): Promise<IBrand> {
        const brand = await this.httpClient.post<IBrand>(`/brands`, data, this.httpHeaders);
        this.cachedBrands.invalidate();
        return brand;
    }

    public async putBrand (data: IBrand): Promise<IBrand> {
        const brand = await this.httpClient.put<IBrand>(`/brands/${data.id}`, data, this.httpHeaders);
        this.cachedBrands.invalidate();
        return brand;
    }

    public async deleteBrand (id: string): Promise<void> {
        await this.httpClient.delete<IBrand>(`/brands/${id}`, undefined, this.httpHeaders);
        this.cachedBrands.invalidate();
    }
}

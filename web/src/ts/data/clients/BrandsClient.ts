import { IApi } from "ts/models/IApi";
import { IBrand, IBrandRequest } from "../../models/api/IBrand";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class BrandsClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedBrands: CachedData<IDataset<IBrand[]>>;

    constructor (private api: IApi, token: string) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getBrands (options?: IBrandRequest): Promise<IBrand[]> {
        if (!this.cachedBrands) {
            this.cachedBrands = new CachedData(async () => this.httpClient.get<IDataset<IBrand[]>>(this.api.data + `/datasets/brands${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const brands = await this.cachedBrands.getData();
        return brands.data;
    }

    public async postBrand (data: IBrand): Promise<IBrand> {
        const brand = await this.httpClient.post<IBrand>(this.api.stockline + `/brands`, data, this.httpHeaders);
        this.cachedBrands.invalidate();
        return brand;
    }

    public async putBrand (data: IBrand): Promise<IBrand> {
        const brand = await this.httpClient.put<IBrand>(this.api.stockline + `/brands/${data.id}`, data, this.httpHeaders);
        this.cachedBrands.invalidate();
        return brand;
    }

    public async deleteBrand (id: string): Promise<void> {
        await this.httpClient.delete<IBrand>(this.api.stockline + `/brands/${id}`, undefined, this.httpHeaders);
        this.cachedBrands.invalidate();
    }
}

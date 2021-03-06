import { IApi } from "ts/models/IApi";
import { IDataset } from "../../models/api/IDataset";
import { IProduct, IProductRequest } from "../../models/api/IProduct";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class ProductsClient {
    private httpClient: HttpClient;
    private httpDatasetClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedProducts: CachedData<IDataset<IProduct[]>>;

    constructor (private api: IApi, token: string) {
        this.httpClient = new HttpClient();
        this.httpDatasetClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getProducts (options?: IProductRequest): Promise<IProduct[]> {
        if (!this.cachedProducts) {
            this.cachedProducts = new CachedData(async () => this.httpDatasetClient.get<IDataset<IProduct[]>>(this.api.data + `/datasets/products${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }

        const products = await this.cachedProducts.getData();
        return products.data;
    }

    public async getProduct (id: string): Promise<IProduct> {
        const products = await this.httpClient.get<IDataset<IProduct[]>>(this.api.data + `/datasets/products?id=${id}`, this.httpHeaders);
        return products?.data[0];
    }

    public async postProduct (data: IProduct): Promise<IProduct> {
        const product = await this.httpClient.post<IProduct>(this.api.stockline + `/products`, data, this.httpHeaders);
        this.cachedProducts.invalidate();
        return product;
    }

    public async putProduct (data: IProduct): Promise<IProduct> {
        const product = await this.httpClient.put<IProduct>(this.api.stockline + `/products/${data.id}`, data, this.httpHeaders);
        this.cachedProducts.invalidate();
        return product;
    }

    public async deleteProduct (id: string): Promise<void> {
        await this.httpClient.delete<IProduct>(this.api.stockline + `/products/${id}`, undefined, this.httpHeaders);
        this.cachedProducts.invalidate();
    }
}

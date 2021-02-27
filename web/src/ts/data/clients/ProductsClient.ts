import { IDataset } from "../../models/api/IDataset";
import { IProduct, IProductRequest } from "../../models/api/IProduct";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class ProductsClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedProducts: CachedData<IDataset<IProduct[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getProducts (options?: IProductRequest): Promise<IProduct[]> {
        if (!this.cachedProducts) {
            this.cachedProducts = new CachedData(async () => this.httpClient.get<IDataset<IProduct[]>>(`/products${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }

        const products = await this.cachedProducts.getData();
        return products.data;
    }

    public async getProduct (id: string): Promise<IProduct> {
        const product = await this.httpClient.get<IProduct>(`/products/${id}`, this.httpHeaders);
        return product;
    }

    public async postProduct (data: IProduct): Promise<IProduct> {
        const product = await this.httpClient.post<IProduct>(`/products`, data, this.httpHeaders);
        this.cachedProducts.invalidate();
        return product;
    }

    public async putProduct (data: IProduct): Promise<IProduct> {
        const product = await this.httpClient.put<IProduct>(`/products/${data.id}`, data, this.httpHeaders);
        this.cachedProducts.invalidate();
        return product;
    }

    public async deleteProduct (id: string): Promise<void> {
        await this.httpClient.delete<IProduct>(`/products/${id}`, undefined, this.httpHeaders);
        this.cachedProducts.invalidate();
    }
}

import { API } from "ts/models/IApi";
import { ICategory, ICategoryRequest } from "../../models/api/ICategory";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class CategoriesClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedCategories: CachedData<IDataset<ICategory[]>>;

    constructor (private api: API, token: string) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getCategories (options?: ICategoryRequest): Promise<ICategory[]> {
        if (!this.cachedCategories) {
            this.cachedCategories = new CachedData(() => this.httpClient.get<IDataset<ICategory[]>>(this.api.data + `/datasets/categories${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const categories = await this.cachedCategories.getData();
        return categories.data;
    }

    public async postCategory (data: ICategory): Promise<ICategory> {
        const category = await this.httpClient.post<ICategory>(this.api.stockline + `/categories`, data, this.httpHeaders);
        this.cachedCategories.invalidate();
        return category;
    }

    public async putCategory (data: ICategory): Promise<ICategory> {
        const category = await this.httpClient.put<ICategory>(this.api.stockline + `/categories/${data.id}`, data, this.httpHeaders);
        this.cachedCategories.invalidate();
        return category;
    }

    public async deleteCategory (id: string): Promise<void> {
        await this.httpClient.delete<ICategory>(this.api.stockline + `/categories/${id}`, undefined, this.httpHeaders);
        this.cachedCategories.invalidate();
    }
}

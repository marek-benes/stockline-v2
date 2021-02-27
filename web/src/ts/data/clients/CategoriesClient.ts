import { ICategory, ICategoryRequest } from "../../models/api/ICategory";
import { IDataset } from "../../models/api/IDataset";
import { CachedData } from "../CachedData";
import { HttpClient } from "./HttpClient";

export class CategoriesClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    private cachedCategories: CachedData<IDataset<ICategory[]>>;

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getCategories (options?: ICategoryRequest): Promise<ICategory[]> {
        if (!this.cachedCategories) {
            this.cachedCategories = new CachedData(() => this.httpClient.get<IDataset<ICategory[]>>(`/categories${this.httpClient.createQueryString(options)}`, this.httpHeaders));
        }
        const categories = await this.cachedCategories.getData();
        return categories.data;
    }

    public async getCategory (id: string): Promise<ICategory> {
        const category = await this.httpClient.get<ICategory>(`/categories/${id}`, this.httpHeaders);
        return category;
    }

    public async postCategory (data: ICategory): Promise<ICategory> {
        const category = await this.httpClient.post<ICategory>(`/categories`, data, this.httpHeaders);
        this.cachedCategories.invalidate();
        return category;
    }

    public async putCategory (data: ICategory): Promise<ICategory> {
        const category = await this.httpClient.put<ICategory>(`/categories/${data.id}`, data, this.httpHeaders);
        this.cachedCategories.invalidate();
        return category;
    }

    public async deleteCategory (id: string): Promise<void> {
        await this.httpClient.delete<ICategory>(`/categories/${id}`, undefined, this.httpHeaders);
        this.cachedCategories.invalidate();
    }
}

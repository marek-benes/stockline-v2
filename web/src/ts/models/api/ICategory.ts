export interface ICategory {
    id: string;
    name: string;
    disabled?: boolean;
}

export interface ICategoryRequest {
    // base options
    page?: number;
    pagesize?: number;
    sort?: string;

    // product options
    name?: string;
    disabled?: boolean;
}

export interface ISupplier {
    id: string;
    name: string;
}

export interface ISupplierRequest {
    // base options
    page?: number;
    pagesize?: number;
    sort?: string;

    // product options
    name?: string;
    disabled?: boolean;
}

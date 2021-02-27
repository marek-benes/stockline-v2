export interface IBrand {
    id: string;
    name: string;
    disabled?: boolean;
}

export interface IBrandRequest {
    // base options
    pagesize?: number;
    page?: number;
    sort?: string;

    // product options
    name?: string;
    disabled?: boolean;
}

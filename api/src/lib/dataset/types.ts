export interface DatasetResult {
    pageSize: number;
    page: number;
    total: number;
    data: any[];
}

export interface QueryOptions {
    ignoreSort?: boolean;
    ignorePaging?: boolean;
}

export interface IDataset<T> {
    page: number;
    pageSize: number;
    total: number;
    data: T;
}
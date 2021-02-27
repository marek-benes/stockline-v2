export interface IProductVariant {
    id: string;
    // product_id?: string;
    size: string;
    color: string;
    barcodes: string[];
    // TODO: stocks
    stocks: any[];

    prices: {
        shops: Array<{
            id: string,
            price: number
        }>
    };
    // disabled: boolean;
}

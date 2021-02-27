import { IProductVariant } from "./IProductVariant";

export type VatRate = "Standard" | "Reduced" | "LowerReduced";

export interface IProduct {
    id: string;
    code: string;
    name: string;
    note: string;
    // description: string; // ?
    // disabled: boolean;

    brand_id: string;
    category_id: string;
    supplier_id: string;

    variants: IProductVariant[];
    prices: {
        shops: Array<{
            id: string,
            price: number
        }>
    };
    vatRate: VatRate;
}

export interface IProductRequest {
    // base options
    page?: number;
    pageSize?: number;
    sort?: string;

    // product options
    sku?: string;
    disabled?: boolean;
}

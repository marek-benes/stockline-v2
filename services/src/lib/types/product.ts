import { ObjectId } from "mongodb";

export type VatRate = "Standard" | "Reduced" | "LowerReduced";

export interface Product {
    id?: ObjectId;
    disabled?: boolean;
    code: string;
    name: string;
    note?: string;
    brandId?: ObjectId;
    categoryId?: ObjectId;
    supplierId?: ObjectId;
    vatRate: VatRate;
    tags?: string[];
    prices?: {
        shops: { id: ObjectId, price: number }[];
    };
}

export interface ProductVariant {
    id?: ObjectId;
    disabled?: boolean;
    productId: ObjectId;
    size?: string;
    color?: string;
    barcodes?: string[];
    prices?: {
        shops: { id: ObjectId, price: number }[];
    };
}

export interface Stock {
    id?: ObjectId;
    storeId: ObjectId;
    warehouseId?: ObjectId;
    variantId: ObjectId;
    quantity: number;
}
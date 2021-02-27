export type ReceiptType = "DeliveryNote" | "GoodsReceivedNote";

export interface IReceipt {
    id?: string;
    store_id: string;
    warehouse_id?: string;
    user_id: string;
    type: ReceiptType;
    timestamp: string;
    number: number;
    items?: any;
}

export interface IDeliveryNote extends IReceipt {
    type: "DeliveryNote";
    destination: string;
    items: Array<{
        variant_id: string;
        quantity: number;
    }>;
}

export interface GoodsReceivedNote extends IReceipt {
    type: "GoodsReceivedNote";
    deliveryNote_id?: string;
}

export interface IReceiptRequest {
    // base options
    page?: number;
    pageSize?: number;
    sort?: string;

    // product options
    from?: string;
    to?: string;
    type?: ReceiptType;
    number?: number;
    store_id?: string;
    warehouse_id?: string;
}
import { VatRate } from "./product";
import { ObjectId } from "mongodb";

export type Operation = "DeliveryNote" | "Receiving" | "Sale";

export interface Price {
    total: number;
    summary: { vatRate: VatRate, taxBase: number, vat: number, total: number }[];
}

export interface Receipt {
    id?: ObjectId;
    storeId: ObjectId;
    userId: ObjectId;
    operation: Operation;
    timestamp: Date;
    number: number;
    extras?: any;
}

export interface DeliveryNote extends Receipt {
    operation: "DeliveryNote";
    extras: {
        warehouseId?: ObjectId;
        destinationStoreId: ObjectId;
        goodsReceivedNoteId?: ObjectId;
        items: {
            variantId: ObjectId;
            quantity: number;
        }[];
    }
}

// export interface GoodsReceivedNote extends Receipt {
//     type: "GoodsReceivedNote";
//     warehouseId?: ObjectId;
//     deliveryNoteId?: ObjectId;
//     items: {
//         variantId: ObjectId;
//         quantity: number;
//     }[];
// }
//
// export interface SalesReceipt extends Receipt {
//     type: "SalesReceipt";
//     price: Price;
//     items: {
//         variantId: ObjectId;
//         quantity: number;
//         vatRate: VatRate;
//         price: number;
//         discount: number;
//     }[];
// }
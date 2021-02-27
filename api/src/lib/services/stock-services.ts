import { Mongo } from "../mongo/mongo";

export class StockServices {

    private readonly mongo: Mongo;

    constructor(mongo: Mongo) {
        this.mongo = mongo;
    }
}

//
//     public async createDeliveryNote(receipt: DeliveryNote): Promise<DeliveryNote> {
//         // Remove from stock
//         for (const item of receipt.items) {
//             await this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity * -1);
//         }
//
//         // Assign receipt number
//         receipt.number = await this.getReceiptNumber(receipt.storeId);
//
//         // Store in collection
//         const id = await this.mongo.insertOne(DbCollection.Receipts, receipt);
//
//         // Get stored receipt
//         return await this.mongo.findOne(DbCollection.Receipts, id);
//     }
//
//     public async createGoodsReceivedNote(receipt: GoodsReceivedNote): Promise<GoodsReceivedNote> {
//         // Add to stock
//         for (const item of receipt.items) {
//             await this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity);
//         }
//
//         // Assign receipt number
//         receipt.number = await this.getReceiptNumber(receipt.storeId);
//
//         // Store in collection
//         const id = await this.mongo.insertOne(DbCollection.Receipts, receipt);
//
//         // GoodsReceivedNote.Id => DeliveryNote
//         if (receipt.deliveryNoteId) {
//             await this.mongo.updateOne<DeliveryNote>(DbCollection.Receipts, { _id: receipt.deliveryNoteId }, { $set: { goodsReceivedNoteId: id } });
//         }
//
//         // Get stored receipt
//         return await this.mongo.findOne(DbCollection.Receipts, id);
//     }
//
//     public async createSalesReceipt(receipt: DeliveryNote): Promise<DeliveryNote> {
//         // Remove from stock
//         for (const item of receipt.items) {
//             await this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity * -1);
//         }
//
//         // Assign receipt number
//         receipt.number = await this.getReceiptNumber(receipt.storeId);
//
//         // Store in collection
//         const id = await this.mongo.insertOne(DbCollection.Receipts, receipt);
//
//         // Get stored receipt
//         return await this.mongo.findOne(DbCollection.Receipts, id);
//     }
//
//
//     private async getReceiptNumber(shopId: ObjectId): Promise<number> {
//         let receipt = await this.mongo.findOne<Receipt>(DbCollection.Receipts, { shopId: shopId }, {
//             limit: 1,
//             sort: { number: -1 }
//         });
//         if (receipt) {
//             return receipt.number;
//         }
//
//         return 2021;
//     }
//
//     private async updateStock(storeId: ObjectId, warehouseId: ObjectId, variantId: ObjectId, quantity) {
//         await this.mongo.updateOne<Stock>(DbCollection.Stocks, {
//             storeId: storeId,
//             warehouseId: warehouseId,
//             variantId: variantId
//         }, {
//             $inc: { quantity: quantity }
//         }, { upsert: true });
//     }
//
// }
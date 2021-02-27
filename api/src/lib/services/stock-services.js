"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockServices = void 0;
const types_1 = require("../mongo/types");
class StockServices {
    constructor(mongo) {
        this.mongo = mongo;
    }
    createDeliveryNote(receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of receipt.items) {
                yield this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity * -1);
            }
            receipt.number = yield this.getReceiptNumber(receipt.storeId);
            const id = yield this.mongo.insertOne(types_1.DbCollection.Receipts, receipt);
            return yield this.mongo.findOne(types_1.DbCollection.Receipts, id);
        });
    }
    createGoodsReceivedNote(receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of receipt.items) {
                yield this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity);
            }
            receipt.number = yield this.getReceiptNumber(receipt.storeId);
            const id = yield this.mongo.insertOne(types_1.DbCollection.Receipts, receipt);
            if (receipt.deliveryNoteId) {
                yield this.mongo.updateOne(types_1.DbCollection.Receipts, { _id: receipt.deliveryNoteId }, { $set: { goodsReceivedNoteId: id } });
            }
            return yield this.mongo.findOne(types_1.DbCollection.Receipts, id);
        });
    }
    createSalesReceipt(receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of receipt.items) {
                yield this.updateStock(receipt.storeId, receipt.warehouseId, item.variantId, item.quantity * -1);
            }
            receipt.number = yield this.getReceiptNumber(receipt.storeId);
            const id = yield this.mongo.insertOne(types_1.DbCollection.Receipts, receipt);
            return yield this.mongo.findOne(types_1.DbCollection.Receipts, id);
        });
    }
    getReceiptNumber(shopId) {
        return __awaiter(this, void 0, void 0, function* () {
            let receipt = yield this.mongo.findOne(types_1.DbCollection.Receipts, { shopId: shopId }, {
                limit: 1,
                sort: { number: -1 }
            });
            if (receipt) {
                return receipt.number;
            }
            return 2021;
        });
    }
    updateStock(storeId, warehouseId, variantId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongo.updateOne(types_1.DbCollection.Stocks, {
                storeId: storeId,
                warehouseId: warehouseId,
                variantId: variantId
            }, {
                $inc: { quantity: quantity }
            }, { upsert: true });
        });
    }
}
exports.StockServices = StockServices;
//# sourceMappingURL=stock-services.js.map
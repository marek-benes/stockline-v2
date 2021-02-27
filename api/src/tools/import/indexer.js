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
exports.MongoIndexer = void 0;
const types_1 = require("../../lib/mongo/types");
class MongoIndexer {
    constructor(mongo) {
        this.mongo = mongo;
    }
    run(dropDatabase) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dropDatabase) {
                yield this.mongo.dropDatabase();
            }
            yield this.mongo.createIndex(types_1.DbCollection.Brands, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Brands, { "name": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Brands, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Categories, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Categories, { "name": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Categories, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Customers, { "regNo": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Customers, { "vatNo": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Customers, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Customers, { "name": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Customers, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "code": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "brandId": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "categoryId": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "supplierId": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Products, { "tags": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.ProductsVariants, { "productId": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.ProductsVariants, { "barcodes": 1 }, {
                unique: true,
                partialFilterExpression: { barcodes: { $exists: true } }
            });
            yield this.mongo.createIndex(types_1.DbCollection.ProductsVariants, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Receipts, { "number": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Receipts, { "timestamp": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Receipts, { "type": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Receipts, { "storeId": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Stores, { "name": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Stores, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Stores, { "shortcut": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Stores, { "type": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Stores, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Suppliers, { "disabled": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Suppliers, { "name": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Suppliers, { "name": "text" });
            yield this.mongo.createIndex(types_1.DbCollection.Users, { "name": 1 });
            yield this.mongo.createIndex(types_1.DbCollection.Users, { "username": 1 }, { unique: true });
            yield this.mongo.createIndex(types_1.DbCollection.Users, { "disabled": 1 });
        });
    }
}
exports.MongoIndexer = MongoIndexer;
//# sourceMappingURL=indexer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.ReceiptsDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");
const mongodb_1 = require("mongodb");

class ReceiptsDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/receipts", types_1.DbCollection.Receipts);
    }

    buildFilterQuery(queryString) {
        let filter = {$and: []};
        if (queryString.from) {
            filter.$and.push({timestamp: {$gte: new Date(queryString.from)}});
        }
        if (queryString.to) {
            filter.$and.push({timestamp: {$lt: new Date(queryString.to)}});
        }
        if (queryString["type"]) {
            filter.$and.push({"type": {$in: queryString["type"].split(",")}});
        }
        if (queryString["number"]) {
            filter.$and.push({"number": Number(queryString["number"])});
        }
        if (queryString["store_id"]) {
            filter.$and.push({"store_id": new mongodb_1.ObjectID(queryString["store_id"])});
        }
        if (queryString["warehouse_id"]) {
            filter.$and.push({"warehouse_id": new mongodb_1.ObjectID(queryString["warehouse_id"])});
        }
        if (filter.$and.length == 0) {
            delete filter.$and;
        }
        return filter;
    }

    buildFindOptions(queryString) {
        return Object.assign(Object.assign({}, super.buildFindOptions(queryString)), {
            projection: {
                "items": 0,
                "note": 0
            }
        });
    }
}

exports.ReceiptsDataset = ReceiptsDataset;
//# sourceMappingURL=receipts-dataset.js.map
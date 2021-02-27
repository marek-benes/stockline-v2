"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.ProductsDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");
const mongodb_1 = require("mongodb");

class ProductsDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/products", types_1.DbCollection.Products);
    }

    buildFilterQuery(queryString) {
        let filter = {$and: []};
        if (queryString["code"]) {
            filter.$and.push({"code": queryString["code"]});
        }
        if (queryString["name"]) {
            filter.$and.push({$text: {$search: queryString["name"]}});
        }
        if (queryString["brand_id"]) {
            filter.$and.push({"brand_id": new mongodb_1.ObjectId(queryString["brand_id"])});
        }
        if (queryString["category_id"]) {
            filter.$and.push({"category_id": new mongodb_1.ObjectId(queryString["category_id"])});
        }
        if (queryString["supplier_id"]) {
            filter.$and.push({"supplier_id": new mongodb_1.ObjectId(queryString["supplier_id"])});
        }
        if (!queryString.hasOwnProperty("disabled")) {
            filter.$and.push({disabled: {$ne: true}});
        }
        if (filter.$and.length == 0) {
            delete filter.$and;
        }
        return filter;
    }

    buildFindOptions(queryString) {
        return Object.assign(Object.assign({}, super.buildFindOptions(queryString)), {
            projection: {
                "note": 0,
                "vatRate": 0,
                prices: 0
            }
        });
    }
}

exports.ProductsDataset = ProductsDataset;
//# sourceMappingURL=products-dataset.js.map
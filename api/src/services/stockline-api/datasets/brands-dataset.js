"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.BrandsDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");

class BrandsDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/brands", types_1.DbCollection.Brands);
    }

    buildFilterQuery(queryString) {
        let filter = {$and: []};
        if (queryString["name"]) {
            filter.$and.push({$text: {$search: queryString["name"]}});
        }
        if (!queryString.hasOwnProperty("disabled")) {
            filter.$and.push({disabled: {$ne: true}});
        }
        if (filter.$and.length == 0) {
            delete filter.$and;
        }
        return filter;
    }
}

exports.BrandsDataset = BrandsDataset;
//# sourceMappingURL=brands-dataset.js.map
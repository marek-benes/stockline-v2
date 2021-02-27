"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.CategoriesDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");

class CategoriesDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/categories", types_1.DbCollection.Categories);
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

exports.CategoriesDataset = CategoriesDataset;
//# sourceMappingURL=categories-dataset.js.map
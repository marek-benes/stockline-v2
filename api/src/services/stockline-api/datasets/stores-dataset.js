"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.StoresDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");

class StoresDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/stores", types_1.DbCollection.Stores);
    }

    buildFilterQuery(queryString) {
        let filter = {$and: []};
        if (queryString["name"]) {
            filter.$and.push({$text: {$search: queryString["name"]}});
        }
        if (queryString["type"]) {
            filter.$and.push({"type": queryString["type"]});
        }
        if (queryString["shortcut"]) {
            filter.$and.push({"shortcut": queryString["shortcut"]});
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

exports.StoresDataset = StoresDataset;
//# sourceMappingURL=stores-dataset.js.map
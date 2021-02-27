"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.CustomersDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");

class CustomersDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/customers", types_1.DbCollection.Customers);
    }

    buildFilterQuery(queryString) {
        let filter = {$and: []};
        if (queryString["name"]) {
            filter.$and.push({$text: {$search: queryString["name"]}});
        }
        if (queryString["regNo"]) {
            filter.$and.push({"regNo": queryString["regNo"]});
        }
        if (queryString["vatNo"]) {
            filter.$and.push({"vatNo": queryString["vatNo"]});
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
                "defaults": 0,
                "note": 0
            }
        });
    }
}

exports.CustomersDataset = CustomersDataset;
//# sourceMappingURL=customers-dataset.js.map
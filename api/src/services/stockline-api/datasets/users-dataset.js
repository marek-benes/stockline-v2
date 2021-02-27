"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.UsersDataset = void 0;
const stockline_dataset_1 = require("../../../lib/dataset/stockline-dataset");
const types_1 = require("../../../lib/mongo/types");

class UsersDataset extends stockline_dataset_1.StocklineDataset {
    constructor(context) {
        super(context, "/users", types_1.DbCollection.Users);
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

    buildFindOptions(queryString) {
        return Object.assign(Object.assign({}, super.buildFindOptions(queryString)), {projection: {"password": 0}});
    }
}

exports.UsersDataset = UsersDataset;
//# sourceMappingURL=users-dataset.js.map
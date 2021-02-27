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
exports.StocklineDataset = void 0;
const mongo_helper_1 = require("../helpers/mongo-helper");
class StocklineDataset {
    constructor(context, route, collection) {
        this.context = context;
        this.route = route;
        this.collection = collection;
    }
    buildFilterQuery(queryString) {
        return {};
    }
    buildFindOptions(queryString) {
        return mongo_helper_1.MongoHelper.buildFindOptions(queryString);
    }
    execute(queryString) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = this.buildFilterQuery(queryString);
            const options = this.buildFindOptions(queryString);
            let count = yield this.context.mongo.countDocuments(this.collection, filter);
            let data = yield this.context.mongo.find(this.collection, filter, options);
            return {
                page: Number(queryString.page || 1),
                pageSize: Number(queryString.pagesize) || undefined,
                total: count,
                data: data
            };
        });
    }
}
exports.StocklineDataset = StocklineDataset;
//# sourceMappingURL=stockline-dataset.js.map
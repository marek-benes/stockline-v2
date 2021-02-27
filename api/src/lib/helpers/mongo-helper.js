"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoHelper = void 0;
class MongoHelper {
    static isDuplicatedKeyError(e) {
        return (e.name === "MongoError" && e.code === 11000);
    }
    static buildFindOptions(query) {
        if (!query) {
            return;
        }
        let options = {};
        if (query.sort) {
            let sort = [];
            query.sort.split(",").forEach(x => {
                const expression = x.split(":");
                const field = expression[0];
                const desc = expression.length == 2 && expression[1] == "desc" ? -1 : 1;
                sort.push([field, desc]);
            });
            options.sort = sort;
        }
        if (query.pagesize) {
            const pageSize = Number(query.pagesize);
            const page = Number(query.page || 1);
            options.skip = (page - 1) * pageSize;
            options.limit = pageSize;
        }
        return options;
    }
}
exports.MongoHelper = MongoHelper;
//# sourceMappingURL=mongo-helper.js.map
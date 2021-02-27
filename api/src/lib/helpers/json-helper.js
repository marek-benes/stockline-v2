"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonHelper = void 0;
const bson_1 = require("bson");
const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
class JsonHelper {
    static stringify(v) {
        return JSON.stringify(v, null, 2);
    }
    static parse(s) {
        return !s ? {} : JSON.parse(s, JsonHelper.reviver);
    }
    static reviver(key, value) {
        if (typeof value == "string") {
            if (value.length == 24 && bson_1.ObjectId.isValid(value)) {
                return new bson_1.ObjectId(value);
            }
            if (ISO_8601_FULL.exec(value)) {
                return new Date(value);
            }
        }
        return value;
    }
}
exports.JsonHelper = JsonHelper;
//# sourceMappingURL=json-helper.js.map
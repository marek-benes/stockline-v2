"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocklineServices = void 0;
const stock_services_1 = require("./stock-services");
class StocklineServices {
    constructor(logger, mongo) {
        this.logger = logger;
        this.mongo = mongo;
        if (!this.mongo) {
            throw new Error("StocklineServices needs access to MongoDB.");
        }
        this.receipts = new stock_services_1.StockServices(this.mongo);
    }
}
exports.StocklineServices = StocklineServices;
//# sourceMappingURL=stockline-services.js.map
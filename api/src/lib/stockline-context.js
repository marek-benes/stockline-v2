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
exports.StocklineContext = void 0;
const logger_1 = require("./logger");
const mongo_1 = require("./mongo/mongo");
const stockline_services_1 = require("./services/stockline-services");
class StocklineContext {
    constructor(options) {
        this.options = options;
        this.logger = new logger_1.Logger({
            level: options.logLevel || logger_1.LogLevel.Info
        });
        this.mongo = new mongo_1.Mongo(this.logger, {
            connectionUrl: options.mongoUrl
        });
        this.services = new stockline_services_1.StocklineServices(this.logger, this.mongo);
    }
    initializeMongo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongo.connect();
        });
    }
}
exports.StocklineContext = StocklineContext;
//# sourceMappingURL=stockline-context.js.map
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
exports.Microservice = void 0;
const stockline_context_1 = require("../stockline-context");
const config_manager_1 = require("../config/config-manager");
const version_1 = require("../version");
class Microservice {
    constructor(name) {
        if (!name) {
            throw new Error(`Null microservice name (in constructor)`);
        }
        this.name = name;
        let config = config_manager_1.ConfigManager.readGlobalConfig();
        this.context = new stockline_context_1.StocklineContext(Object.assign({}, config.context));
        this.context.logger.d(`Context created`);
        this.context.logger.d(JSON.stringify(this.context.options, null, 2));
        this.options = Object.assign({}, config[name]);
        this.context.logger.d(`Options created`);
        this.context.logger.d(JSON.stringify(this.options, null, 2));
        this.context.logger.i(`Microservice created. Version ${version_1.STOCKLINE_VERSION}.`);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.logger.i(`Running now. My name is ${this.name}`);
        });
    }
}
exports.Microservice = Microservice;
//# sourceMappingURL=microservice.js.map
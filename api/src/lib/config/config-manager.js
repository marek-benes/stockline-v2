"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const json_helper_1 = require("../helpers/json-helper");
const ENV_STOCKLINE_ENV = process.env.STOCKLINE_ENV;
const CONF_DIR = "conf";
const CONF_NAME = ENV_STOCKLINE_ENV ? `config-${ENV_STOCKLINE_ENV}.json` : `config.json`;
class ConfigManager {
    static readGlobalConfig() {
        try {
            let content = fs.readFileSync(path.resolve(process.cwd(), CONF_DIR, CONF_NAME), "UTF-8");
            console.info(`Config loaded from ${CONF_DIR}/${CONF_NAME}`);
            return Object.assign({}, json_helper_1.JsonHelper.parse(content));
        }
        catch (e) {
            console.error(`Could not read ${CONF_DIR}/${name} file (${e.message})`);
            throw e;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map
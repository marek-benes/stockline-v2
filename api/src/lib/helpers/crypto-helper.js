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
exports.CryptoHelper = void 0;
const crypto = __importStar(require("crypto"));
class CryptoHelper {
    static hashPassword(password) {
        let salt = crypto.randomBytes(16).toString("base64");
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keylen, `sha512`).toString(CryptoHelper.encoding);
        return salt + ":" + hash;
    }
    static verifyPassword(password, hashedPassword) {
        let splits = hashedPassword.split(":");
        let x = splits[1];
        let hash = crypto.pbkdf2Sync(password, splits[0], this.iterations, this.keylen, `sha512`).toString(CryptoHelper.encoding);
        return hash == x;
    }
    static generateToken() {
        return crypto.randomBytes(16).toString("hex");
    }
}
exports.CryptoHelper = CryptoHelper;
CryptoHelper.iterations = 10000;
CryptoHelper.keylen = 64;
CryptoHelper.encoding = "base64";
//# sourceMappingURL=crypto-helper.js.map
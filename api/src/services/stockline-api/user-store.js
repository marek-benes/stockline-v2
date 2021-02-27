"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.UserStore = void 0;
const crypto_helper_1 = require("../../lib/helpers/crypto-helper");
const moment_1 = __importDefault(require("moment"));
const TOKEN_LIFETIME = 20;
var UserStore;
(function (UserStore) {
    let authUsers = {};

    function addAuthUser(user) {
        let token = crypto_helper_1.CryptoHelper.generateToken();
        authUsers[token] = {
            expiration: moment_1.default().add(TOKEN_LIFETIME, "minutes").toDate(),
            user: {
                id: user.id,
                name: user.name,
                module: user.module,
                token: token
            }
        };
        return token;
    }

    UserStore.addAuthUser = addAuthUser;

    function getAuthUser(token, renewToken) {
        let authUser = authUsers[token];
        if (!authUser) {
            return null;
        }
        if (renewToken) {
            authUser.expiration = moment_1.default().add(TOKEN_LIFETIME, "minutes").toDate();
        }
        return authUser.user;
    }

    UserStore.getAuthUser = getAuthUser;

    function deleteToken(token) {
        delete authUsers[token];
    }

    UserStore.deleteToken = deleteToken;

    function deleteAuthUser(id) {
        for (let key of Object.keys(authUsers)) {
            if (authUsers[key].user.id == id) {
                delete authUsers[key];
            }
        }
    }

    UserStore.deleteAuthUser = deleteAuthUser;
})(UserStore = exports.UserStore || (exports.UserStore = {}));
//# sourceMappingURL=user-store.js.map
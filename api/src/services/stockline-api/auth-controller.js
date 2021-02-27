"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
            resolve(value);
        });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.AuthController = void 0;
const restify_errors_1 = require("restify-errors");
const api_controller_1 = require("../../lib/rest/api-controller");
const user_store_1 = require("./user-store");
const crypto_helper_1 = require("../../lib/helpers/crypto-helper");
const types_1 = require("../../lib/mongo/types");

class AuthController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.validate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.send(200, {
                name: req.user.name,
                module: req.user.module
            });
            return next();
        });
        this.loginUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body) {
                return next(new restify_errors_1.BadRequestError(`Empty payload. Expecting JSON with username and password properties.`));
            }
            if (!req.body.username) {
                return next(new restify_errors_1.BadRequestError(`Username property is null`));
            }
            if (!req.body.password) {
                return next(new restify_errors_1.BadRequestError(`Password property is null`));
            }
            let user = yield this.context.mongo.findOne(types_1.DbCollection.Users, {username: req.body.username});
            if (!user) {
                return next(new restify_errors_1.UnauthorizedError(`User with username ${req.body.username} not found`));
            }
            if (!crypto_helper_1.CryptoHelper.verifyPassword(req.body.password, user.password)) {
                return next(new restify_errors_1.UnauthorizedError(`Wrong password`));
            }
            if (user.disabled) {
                return next(new restify_errors_1.UnauthorizedError(`User with username ${req.body.username} is disabled`));
            }
            let token = user_store_1.UserStore.addAuthUser(user);
            res.send(200, {
                token: token,
                name: user.name,
                module: user.module
            });
            return next();
        });
        this.logoutUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            user_store_1.UserStore.deleteToken(req.user.token);
            res.send(200);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/auth", handler: this.validate},
            {method: "POST", route: "/auth", handler: this.loginUser},
            {method: "DELETE", route: "/auth", handler: this.logoutUser}
        ];
    }
}

exports.AuthController = AuthController;
//# sourceMappingURL=auth-controller.js.map
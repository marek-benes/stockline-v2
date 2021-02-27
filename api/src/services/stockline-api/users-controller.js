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
exports.UsersController = void 0;
const api_controller_1 = require("../../lib/rest/api-controller");
const restify_errors_1 = require("restify-errors");
const user_store_1 = require("./user-store");
const crypto_helper_1 = require("../../lib/helpers/crypto-helper");
const types_1 = require("../../lib/mongo/types");

class UsersController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.getUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.context.mongo.findOne(types_1.DbCollection.Users, req.params.id, {projection: {"password": 0}});
            if (user == null) {
                res.send(204);
            } else {
                res.send(200, user);
            }
            return next();
        });
        this.postUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body) {
                return next(new restify_errors_1.BadRequestError(`Empty payload. Expecting JSON with mandatory user properties.`));
            }
            if (!req.body.username) {
                return next(new restify_errors_1.BadRequestError("Property `username` is required"));
            }
            if (!req.body.password) {
                return next(new restify_errors_1.BadRequestError("Property `password` is required"));
            }
            if (!req.body.name) {
                return next(new restify_errors_1.BadRequestError("Property `name` is required"));
            }
            let user = yield this.context.mongo.insertOne(types_1.DbCollection.Users, {
                name: req.body.name,
                username: req.body.name,
                password: crypto_helper_1.CryptoHelper.hashPassword(req.body.password),
                module: req.body.module,
                disabled: false
            });
            delete user["password"];
            res.send(200, user);
            return next();
        });
        this.putUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body) {
                return next(new restify_errors_1.BadRequestError(`Empty payload. Expecting JSON with mandatory user properties.`));
            }
            if (!req.body.name) {
                return next(new restify_errors_1.BadRequestError("Property `name` is required"));
            }
            let user = yield this.context.mongo.findOne(types_1.DbCollection.Users, req.params.id);
            if (!user) {
                return next(new restify_errors_1.NotFoundError("User not found"));
            }
            user.name = req.body.name;
            user.module = req.body.module;
            user.disabled = req.body.disabled;
            yield this.context.mongo.updateOne(types_1.DbCollection.Users, user.id, {
                $set: {
                    name: user.name,
                    module: user.module,
                    disabled: user.disabled
                }
            });
            user_store_1.UserStore.deleteAuthUser(user.id);
            delete user["password"];
            res.send(200, user);
            return next();
        });
        this.deleteUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.context.mongo.deleteOne(types_1.DbCollection.Users, req.params.id);
            user_store_1.UserStore.deleteAuthUser(req.params.id);
            res.send(200);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/users/:id", handler: this.getUser},
            {method: "POST", route: "/users", handler: this.postUser},
            {method: "PUT", route: "/users/:id", handler: this.putUser},
            {method: "DELETE", route: "/users/:id", handler: this.deleteUser}
        ];
    }
}

exports.UsersController = UsersController;
//# sourceMappingURL=users-controller.js.map
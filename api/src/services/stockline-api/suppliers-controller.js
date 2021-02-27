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
exports.SuppliersController = void 0;
const api_controller_1 = require("../../lib/rest/api-controller");
const types_1 = require("../../lib/mongo/types");
const restify_errors_1 = require("restify-errors");
const mongo_helper_1 = require("../../lib/helpers/mongo-helper");
const bson_1 = require("bson");

class SuppliersController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.getSupplier = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const document = yield this.context.mongo.findOne(types_1.DbCollection.Suppliers, new bson_1.ObjectId(req.params.id));
            if (!document) {
                return next(new restify_errors_1.BadRequestError());
            }
            res.send(200, document);
            return next();
        });
        this.postSupplier = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = req.body) === null || _a === void 0 ? void 0 : _a.name)) {
                return next(new restify_errors_1.UnprocessableEntityError("Field `name` is required."));
            }
            try {
                yield this.context.mongo.replaceOne(types_1.DbCollection.Suppliers, {
                    name: req.body.name, disabled: true
                }, {name: req.body.name, disabled: false}, {upsert: true});
                res.send(200);
                return next();
            } catch (e) {
                if (mongo_helper_1.MongoHelper.isDuplicatedKeyError(e)) {
                    return next(new restify_errors_1.UnprocessableEntityError("Name already in use."));
                }
                throw e;
            }
        });
        this.putSupplier = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            if (!((_b = req.body) === null || _b === void 0 ? void 0 : _b.name)) {
                return next(new restify_errors_1.UnprocessableEntityError("Field `name` is required."));
            }
            try {
                let result = yield this.context.mongo.updateOne(types_1.DbCollection.Suppliers, new bson_1.ObjectId(req.params.id), {
                    $set: {
                        name: req.body.name,
                        disabled: false
                    }
                });
                if (result.modifiedCount == 0) {
                    return next(new restify_errors_1.BadRequestError("Supplier not found."));
                }
                res.send(200);
                return next();
            } catch (e) {
                if (mongo_helper_1.MongoHelper.isDuplicatedKeyError(e)) {
                    return next(new restify_errors_1.UnprocessableEntityError("Name already in use."));
                }
                throw e;
            }
        });
        this.deleteSupplier = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = new bson_1.ObjectId(req.params.id);
            const count = yield this.context.mongo.countDocuments(types_1.DbCollection.Products, {supplier_id: id});
            if (count > 0) {
                yield this.context.mongo.updateOne(types_1.DbCollection.Suppliers, id, {$set: {disabled: true}});
            } else {
                yield this.context.mongo.deleteOne(types_1.DbCollection.Suppliers, id);
            }
            res.send(200);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/suppliers/:id", handler: this.getSupplier},
            {method: "POST", route: "/suppliers", handler: this.postSupplier},
            {method: "PUT", route: "/suppliers/:id", handler: this.putSupplier},
            {method: "DELETE", route: "/suppliers/:id", handler: this.deleteSupplier}
        ];
    }
}

exports.SuppliersController = SuppliersController;
//# sourceMappingURL=suppliers-controller.js.map
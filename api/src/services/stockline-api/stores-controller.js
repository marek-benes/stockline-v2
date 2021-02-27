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
exports.StoresController = void 0;
const api_controller_1 = require("../../lib/rest/api-controller");
const types_1 = require("../../lib/mongo/types");
const restify_errors_1 = require("restify-errors");
const bson_1 = require("bson");

class StoresController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.getStore = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const document = yield this.context.mongo.findOne(types_1.DbCollection.Stores, new bson_1.ObjectId(req.params.id));
            if (!document) {
                return next(new restify_errors_1.BadRequestError());
            }
            res.send(200, document);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/stores/:id", handler: this.getStore}
        ];
    }
}

exports.StoresController = StoresController;
//# sourceMappingURL=stores-controller.js.map
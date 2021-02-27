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
exports.ReceiptsController = void 0;
const api_controller_1 = require("../../lib/rest/api-controller");
const types_1 = require("../../lib/mongo/types");
const restify_errors_1 = require("restify-errors");

class ReceiptsController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.getReceipt = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.context.mongo.findOne(types_1.DbCollection.Receipts, req.params.id);
            if (receipt == null) {
                res.send(204);
            } else {
                res.send(200, receipt);
            }
            return next();
        });
        this.postReceipt = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let receipt;
                switch (req.query.type) {
                    case "DeliveryNote":
                        receipt = yield this.context.services.receipts.createDeliveryNote(req.query);
                        break;
                    case "GoodsReceivedNote":
                        receipt = yield this.context.services.receipts.createGoodsReceivedNote(req.query);
                        break;
                    case "SalesReceipt":
                        receipt = yield this.context.services.receipts.createSalesReceipt(req.query);
                        break;
                    default:
                        return next(new restify_errors_1.BadRequestError(`Receipt type ${req.query.type} not supported`));
                }
                res.send(200, receipt);
                return next();
            } catch (e) {
                if (e instanceof restify_errors_1.BadRequestError) {
                    return next(e);
                } else {
                    this.context.logger.w(`Error occurred during receipt creating. Message: ${e.message}`);
                    return next(new restify_errors_1.InternalServerError(e.message));
                }
            }
        });
        this.deleteReceipt = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.context.mongo.deleteOne(types_1.DbCollection.Receipts, req.params.id);
            res.send(200);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/receipts/:id", handler: this.getReceipt},
            {method: "POST", route: "/receipts", handler: this.postReceipt},
            {method: "DELETE", route: "/receipts/:id", handler: this.deleteReceipt}
        ];
    }
}

exports.ReceiptsController = ReceiptsController;
//# sourceMappingURL=receipts-controller.js.map
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
exports.ProductsController = void 0;
const api_controller_1 = require("../../lib/rest/api-controller");
const types_1 = require("../../lib/mongo/types");
const bson_1 = require("bson");
const restify_errors_1 = require("restify-errors");

class ProductsController extends api_controller_1.ApiController {
    constructor(context) {
        super(context);
        this.getProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const product = yield this.context.mongo.findOne(types_1.DbCollection.Products, new bson_1.ObjectId(req.params.id));
            if (!product) {
                return next(new restify_errors_1.BadRequestError());
            }
            const variants = yield this.context.mongo.find(types_1.DbCollection.ProductsVariants, {product_id: product.id}, {
                sort: {
                    "color": 1,
                    "size": 1
                }, projection: {
                    product_id: 0
                }
            });
            let result = Object.assign(Object.assign({}, product), {variants: []});
            for (const variant of variants) {
                const stock = yield this.context.mongo.find(types_1.DbCollection.Stocks, {variant_id: variant.id}, {
                    projection: {
                        variant_id: 0
                    }
                });
                result.variants.push(Object.assign(Object.assign({}, variant), {stocks: stock}));
                result.variants.push(Object.assign({}, variant));
            }
            res.send(200, result);
            return next();
        });
    }

    getRoutes() {
        return [
            {method: "GET", route: "/products/:id", handler: this.getProduct}
        ];
    }
}

exports.ProductsController = ProductsController;
//# sourceMappingURL=products-controller.js.map
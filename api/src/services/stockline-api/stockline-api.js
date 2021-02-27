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
exports.StocklineApi = void 0;
const api_server_1 = require("../../lib/rest/api-server");
const auth_controller_1 = require("./auth-controller");
const users_controller_1 = require("./users-controller");
const stores_controller_1 = require("./stores-controller");
const products_controller_1 = require("./products-controller");
const customers_controller_1 = require("./customers-controller");
const categories_controller_1 = require("./categories-controller");
const suppliers_controller_1 = require("./suppliers-controller");
const brands_controller_1 = require("./brands-controller");
const restify_errors_1 = require("restify-errors");
const dataset_store_1 = require("./dataset-store");
const receipts_controller_1 = require("./receipts-controller");

class StocklineApi extends api_server_1.ApiServer {
    constructor() {
        var _a;
        super("StocklineApi");
        this.getDataset = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = new Date().getTime();
                let dataset = this.datasets.find(x => x.route == req.getRoute().path);
                let data = yield dataset.execute(StocklineApi.propertiesToLowerCase(req.query));
                this.context.logger.i(`${dataset.route} executed (${new Date().getTime() - startTime}ms)`);
                res.send(200, data);
                return next();
            } catch (e) {
                if (e instanceof restify_errors_1.BadRequestError) {
                    return next(e);
                } else {
                    this.context.logger.w(`Error occurred during dataset executing. Message: ${e.message}`);
                    return next(new restify_errors_1.InternalServerError(e.message));
                }
            }
        });
        this.addController(new auth_controller_1.AuthController(this.context));
        this.addController(new products_controller_1.ProductsController(this.context));
        this.addController(new users_controller_1.UsersController(this.context));
        this.addController(new brands_controller_1.BrandsController(this.context));
        this.addController(new categories_controller_1.CategoriesController(this.context));
        this.addController(new customers_controller_1.CustomersController(this.context));
        this.addController(new receipts_controller_1.ReceiptsController(this.context));
        this.addController(new stores_controller_1.StoresController(this.context));
        this.addController(new suppliers_controller_1.SuppliersController(this.context));
        this.datasets = [];
        for (let key of Object.keys(dataset_store_1.DATASET_STORE)) {
            let dataset = new dataset_store_1.DATASET_STORE[key](this.context);
            if (!(dataset === null || dataset === void 0 ? void 0 : dataset.route)) {
                this.context.logger.w(`Dataset ${key} has no valid route`);
                continue;
            }
            if (!((_a = dataset.route) === null || _a === void 0 ? void 0 : _a.startsWith("/"))) {
                this.context.logger.w(`Dataset ${key} has invalid route (not starting with /)`);
                continue;
            }
            this.datasets.push(dataset);
            this.addRoute("GET", dataset.route, this.getDataset);
        }
        this.context.logger.i(`Registered ${this.datasets.length} dataset(s) from store`);
    }

    static propertiesToLowerCase(o) {
        let key, keys = Object.keys(o);
        let n = keys.length;
        let l = {};
        while (n--) {
            key = keys[n];
            l[key.toLowerCase()] = o[key];
        }
        return l;
    }
}

exports.StocklineApi = StocklineApi;
//# sourceMappingURL=stockline-api.js.map
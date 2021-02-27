"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServer = void 0;
const restify_1 = require("restify");
const restify_errors_1 = require("restify-errors");
const microservice_1 = require("../microservice/microservice");
const user_store_1 = require("../../stockline-api/user-store");
const version_1 = require("../version");
const json_helper_1 = require("../helpers/json-helper");
const HEADER_SERVER = "STOCKLINE API Server";
const HEADER_AUTHORIZATION = "Authorization";
class ApiServer extends microservice_1.Microservice {
    constructor(name) {
        var _a;
        super(name);
        this.endpoints = [];
        this.getInfo = (req, res, next) => {
            res.send(200, {
                "api": this.constructor.name,
                "version": version_1.STOCKLINE_VERSION,
                "endpoints": this.endpoints
            });
            return next();
        };
        this.enableCors = (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            if (req.method == "OPTIONS") {
                res.send(200);
                return;
            }
            return next();
        };
        this.customHeaders = (req, res, next) => {
            res.removeHeader("Server");
            res.header("Server", HEADER_SERVER);
            return next();
        };
        this.authorization = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const path = req.path();
            if (path == "/info") {
                return next();
            }
            if (path == "/auth" && req.method == "POST") {
                return next();
            }
            const tokenValues = (_b = req.header(HEADER_AUTHORIZATION)) === null || _b === void 0 ? void 0 : _b.split(" ");
            if (!tokenValues || tokenValues.length != 2) {
                next(new restify_errors_1.NotAuthorizedError("Invalid or malformed token (expected `Basic` token within the Authorization header)"));
                return;
            }
            let user = null;
            if (tokenValues[0] == "Basic") {
                user = yield this.getUser(tokenValues[1], !(path == "/auth" && req.method == "GET"));
            }
            else {
                return next(new restify_errors_1.NotAuthorizedError(`Unsupported authentication scheme ${tokenValues[0]}`));
            }
            if (!user) {
                return next(new restify_errors_1.NotAuthorizedError(`User with token ${tokenValues[1]} not found`));
            }
            req.user = user;
            return next();
        });
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.port)) {
            throw new Error(`Missing port in options (options.port)`);
        }
        this.server = restify_1.createServer();
        this.server.pre(this.enableCors);
        this.server.use(this.customHeaders);
        this.server.use(restify_1.plugins.bodyParser({ reviver: json_helper_1.JsonHelper.reviver }));
        this.server.use(restify_1.plugins.queryParser());
        this.server.use(this.authorization);
        this.addRoute("GET", "/info", this.getInfo);
    }
    onStart() {
    }
    addController(controller) {
        this.addRoutes(controller.getRoutes());
    }
    addRoutes(routes) {
        for (let i = 0; i < routes.length; i++) {
            this.addRoute(routes[i].method, routes[i].route, routes[i].handler);
        }
    }
    addRoute(method, route, handler) {
        const saveHandler = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let start = new Date().getTime();
                let result = yield handler(req, res, next);
                let duration = new Date().getTime() - start;
                this.context.logger.d(`${method} ${req.url} (finished in ${duration}ms)`);
                return result;
            }
            catch (e) {
                this.context.logger.w(`Unexpected error in pipeline (${e.message})`);
                return next(new restify_errors_1.InternalServerError(e.message));
            }
        });
        switch (method) {
            case "GET":
                this.server.get(route, saveHandler);
                break;
            case "POST":
                this.server.post(route, saveHandler);
                break;
            case "PUT":
                this.server.put(route, saveHandler);
                break;
            case "PATCH":
                this.server.patch(route, saveHandler);
                break;
            case "DELETE":
                this.server.del(route, saveHandler);
                break;
            default:
                this.context.logger.w(`Unknown method ${method}, route handler will be not registered`);
        }
        this.endpoints.push(`${method} ${route}`);
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.initializeMongo();
            yield _super.run.call(this);
            this.server.listen(this.options.port, () => {
                this.context.logger.i(`For more info open http://localhost:${this.options.port}/info in your browser`);
                this.onStart();
            });
        });
    }
    debug() {
        this.context.logger.i(this.server.getDebugInfo());
    }
    getUser(token, renewToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let authUser = user_store_1.UserStore.getAuthUser(token, renewToken);
            if (!authUser) {
                this.context.logger.d(`Not existing user associated with token ${token}`);
                return undefined;
            }
            return {
                id: authUser.id,
                name: authUser.name,
                module: authUser.module,
                token: token
            };
        });
    }
}
exports.ApiServer = ApiServer;
//# sourceMappingURL=api-server.js.map
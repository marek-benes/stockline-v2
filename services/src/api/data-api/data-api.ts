import { ApiServer } from "../../lib/rest/api-server";
import { Next, Request, RequestHandler, Response } from "restify";
import { ApiServerOptions } from "../../lib/rest/types";
import { Dataset } from "./dataset";
import { DATASET_STORE, MODEL_STORE } from "./stores";
import { Model } from "./model";
import { Utils } from "../../lib/utils";

export class DataApi extends ApiServer<ApiServerOptions> {

    private datasets: { [key: string]: Dataset } = {};
    private models: { [key: string]: Model } = {};

    public constructor() {
        super("Api.Data", 62802);

        // Register all datasets in store
        for (let key of Object.keys(DATASET_STORE)) {
            const route = `/datasets/${Utils.toKebabCase(key.replace("Dataset", ""))}`;
            this.datasets[route] = new DATASET_STORE[key](this.context);
            this.addRoute("GET", route, this.getDataset);
        }
        this.context.logger.i(`Registered ${Object.keys(DATASET_STORE).length} dataset(s) from store`);

        // Register all models in store
        for (let key of Object.keys(MODEL_STORE)) {
            const route = `/models/${Utils.toKebabCase(key.replace("Model", ""))}`;
            this.models[route] = new MODEL_STORE[key](this.context);
            this.addRoute("GET", route, this.getModel);

        }
        this.context.logger.i(`Registered ${Object.keys(MODEL_STORE).length} model(s) from store`);
    }

    public getDataset: RequestHandler = async (req: Request, res: Response, next: Next) => {
        const startTime = new Date().getTime();
        const route: string = <string>req.getRoute().path;

        // Find dataset
        let dataset = this.datasets[route];

        // Dataset execution
        let data = await dataset.execute(DataApi.propertiesToLowerCase(req.query));

        this.context.logger.i(`${route} executed (${new Date().getTime() - startTime}ms)`);

        // Response 200 Ok
        res.send(200, data);
        return next();
    };

    public getModel: RequestHandler = async (req: Request, res: Response, next: Next) => {
        const startTime = new Date().getTime();
        const route: string = <string>req.getRoute().path;

        // Find action
        let model = this.models[route];

        // Model execution
        let data = await model.execute(DataApi.propertiesToLowerCase(req.query));

        this.context.logger.i(`${route} executed (${new Date().getTime() - startTime}ms)`);

        // Response 200 Ok
        res.send(200, data);
        return next();
    };

    private static propertiesToLowerCase(o: any): any {
        let key, keys = Object.keys(o);
        let n = keys.length;
        let l: any = {};
        while (n--) {
            key = keys[n];
            l[key.toLowerCase()] = o[key];
        }

        return l;
    }

}
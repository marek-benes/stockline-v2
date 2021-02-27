import { ApiServer } from "../../lib/rest/api-server";
import { StocklineApiServerOptions } from "./types";
import { AuthController } from "./auth-controller";
import { UsersController } from "./users-controller";
import { StoresController } from "./stores-controller";
import { ProductsController } from "./products-controller";
import { CustomersController } from "./customers-controller";
import { CategoriesController } from "./categories-controller";
import { SuppliersController } from "./suppliers-controller";
import { BrandsController } from "./brands-controller";
import { StocklineDataset } from "../../lib/dataset/stockline-dataset";
import { BadRequestError, InternalServerError } from "restify-errors";
import { Next, Request, RequestHandler, Response } from "restify";
import { DATASET_STORE } from "./dataset-store";
import { ReceiptsController } from "./receipts-controller";

export class StocklineApi extends ApiServer<StocklineApiServerOptions> {

    private datasets: StocklineDataset[];

    public constructor() {
        super("StocklineApi");

        // Add  controllers
        this.addController(new AuthController(this.context));
        this.addController(new ProductsController(this.context));
        this.addController(new UsersController(this.context));
        this.addController(new BrandsController(this.context));
        this.addController(new CategoriesController(this.context));
        this.addController(new CustomersController(this.context));
        this.addController(new ReceiptsController(this.context));
        this.addController(new StoresController(this.context));
        this.addController(new SuppliersController(this.context));

        // Datasets registry
        this.datasets = [];
        // Register all datasets in store
        for (let key of Object.keys(DATASET_STORE)) {
            let dataset: StocklineDataset = new DATASET_STORE[key](this.context);

            // Validation
            if (!dataset?.route) {
                this.context.logger.w(`Dataset ${key} has no valid route`);
                continue;
            }
            if (!dataset.route?.startsWith("/")) {
                this.context.logger.w(`Dataset ${key} has invalid route (not starting with /)`);
                continue;
            }

            // Push to evidence
            this.datasets.push(dataset);

            // Add route handler
            this.addRoute("GET", dataset.route, this.getDataset);
        }

        this.context.logger.i(`Registered ${this.datasets.length} dataset(s) from store`);
    }

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

    // GET ${dataset.descriptor.route}
    public getDataset: RequestHandler = async (req: Request, res: Response, next: Next) => {
        try {
            const startTime = new Date().getTime();

            // Find dataset
            let dataset = this.datasets.find(x => x.route == req.getRoute().path);

            // Dataset execution
            let data = await dataset.execute(StocklineApi.propertiesToLowerCase(req.query));

            this.context.logger.i(`${dataset.route} executed (${new Date().getTime() - startTime}ms)`);

            // Response 200 Ok
            res.send(200, data);
            return next();
        }
        catch (e) {
            if (e instanceof BadRequestError) {
                return next(e);
            }
            else {
                this.context.logger.w(`Error occurred during dataset executing. Message: ${e.message}`);
                return next(new InternalServerError(e.message));
            }

        }
    };

}

import { Mongo } from "../mongo/mongo";
import { Logger } from "../logger";
import { StockServices } from "./stock-services";

export class StocklineServices {

    public readonly receipts: StockServices;
    private readonly logger: Logger;
    private readonly mongo: Mongo;

    constructor(logger: Logger, mongo: Mongo) {
        this.logger = logger;
        this.mongo = mongo;

        // We need Mongo access
        if (!this.mongo) {
            throw new Error("StocklineServices needs access to MongoDB.");
        }

        // Create services instance
        this.receipts = new StockServices(this.mongo);
    }

}

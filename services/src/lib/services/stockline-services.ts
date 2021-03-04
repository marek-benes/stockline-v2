import { Mongo } from "../mongo/mongo";
import { Logger } from "../logger";
import { StockServices } from "./stock-services";
import { UserServices } from "./user-services";

export class StocklineServices {

    public readonly receipts: StockServices;
    public readonly users: UserServices;
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
        this.users = new UserServices(this.mongo);
    }

}

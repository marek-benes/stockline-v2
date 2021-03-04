import { Logger, LogLevel } from "./logger";
import { Mongo } from "./mongo/mongo";
import { StocklineServices } from "./services/stockline-services";

export class StocklineContext {

    public readonly options: StocklineContextOptions;
    public readonly services: StocklineServices;
    public readonly logger: Logger;
    public readonly mongo: Mongo;

    public constructor(options: StocklineContextOptions) {
        this.options = options;

        // Logger init
        this.logger = new Logger({
            level: options.logLevel || LogLevel.Info
        });

        // Mongo init
        this.mongo = new Mongo(this.logger, {
            connectionUrl: options.mongoUrl
        });

        // Services library instance
        this.services = new StocklineServices(this.logger, this.mongo);
    }

    public async initializeMongo(): Promise<void> {
        await this.mongo.connect();
    }

}

export interface StocklineContextOptions {
    mongoUrl: string,
    logLevel?: LogLevel;
}

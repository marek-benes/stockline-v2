import { MicroserviceOptions } from "./types";
import { StocklineContext } from "../stockline-context";
import { ConfigManager } from "../config/config-manager";
import { STOCKLINE_VERSION } from "../version";


export abstract class Microservice<T extends MicroserviceOptions> {

    // Properties
    protected context: StocklineContext;
    protected name: string;
    protected options: T;

    protected constructor(name: string) {
        // Validation
        if (!name) {
            throw new Error(`Null microservice name (in constructor)`);
        }

        this.name = name;

        // Read global config file
        let config = ConfigManager.readGlobalConfig();

        // Construct new context
        this.context = new StocklineContext({
            ...config.context   // Based on global configuration
        });

        // Log context config
        this.context.logger.d(`Context created`);
        this.context.logger.d(JSON.stringify(this.context.options, null, 2));

        // Construct new options from global config
        this.options = {
            ...config[name]     // Options from global config
        };

        this.context.logger.d(`Options created`);
        this.context.logger.d(JSON.stringify(this.options, null, 2));

        // Log startup
        this.context.logger.i(`Microservice created. Version ${STOCKLINE_VERSION}.`);
    }

    public async run(): Promise<void> {
        this.context.logger.i(`Running now. My name is ${this.name}`);
    }

}

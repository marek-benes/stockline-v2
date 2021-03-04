import { StocklineContext } from "../../lib/stockline-context";

export abstract class MaintenanceScript {

    protected readonly context: StocklineContext;

    protected constructor(context: StocklineContext) {
        this.context = context;
    }

    public abstract execute(body?: any): Promise<void>;
}
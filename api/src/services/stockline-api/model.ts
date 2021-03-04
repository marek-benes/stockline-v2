import { StocklineContext } from "../../lib/stockline-context";

export abstract class Model {

    protected readonly context: StocklineContext;

    protected constructor(context: StocklineContext) {
        this.context = context;
    }

    public abstract execute(queryString: any): Promise<any>;
}

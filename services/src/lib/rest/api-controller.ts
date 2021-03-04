import { ApiRoute } from "./types";
import { StocklineContext } from "../stockline-context";

export abstract class ApiController {

    // Properties
    protected context: StocklineContext;

    protected constructor(context: StocklineContext) {
        this.context = context;
    }

    public abstract getRoutes(): ApiRoute[];
}

import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { StocklineContext } from "../../../lib/stockline-context";

export class StoresController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [];
    }

}

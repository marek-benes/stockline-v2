import { ApiController } from "../../lib/rest/api-controller";
import { ApiRoute } from "../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../lib/mongo/types";
import { StocklineContext } from "../../lib/stockline-context";
import { BadRequestError } from "restify-errors";
import { ObjectId } from "bson";

export class StoresController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/stores/:id", handler: this.getStore }
        ];
    }

    public getStore: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Find document
        const document = await this.context.mongo.findOne(DbCollection.Stores, new ObjectId(req.params.id));

        // Not found?
        if (!document) {
            return next(new BadRequestError());
        }

        // Send response
        res.send(200, document);

        return next();
    };

}

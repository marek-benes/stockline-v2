import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { Supplier } from "../../../lib/types/supplier";
import { ObjectId } from "bson";

export class SuppliersController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "POST", route: "/suppliers", handler: this.postSupplier },
            { method: "PUT", route: "/suppliers/:id", handler: this.putSupplier },
            { method: "DELETE", route: "/suppliers/:id", handler: this.deleteSupplier }
        ];
    }

    public postSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {

        await this.context.mongo.replaceOne<Supplier>(DbCollection.Suppliers,
            { name: req.body.name },
            { name: req.body.name, disabled: false }, { upsert: true }
        );

        // Send response
        res.send(204);
        return next();
    };

    public putSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update or enable existing
        await this.context.mongo.updateOne<Supplier>(DbCollection.Suppliers, new ObjectId(req.params.id),
            { $set: { name: req.body.name, disabled: false } }
        );

        // Send response
        res.send(204);
        return next();
    };

    public deleteSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update `disabled` field in document
        await this.context.mongo.updateOne<Supplier>(DbCollection.Suppliers, new ObjectId(req.params.id),
            { $set: { disabled: true } }
        );

        // Send response
        res.send(204);
        return next();
    };

}

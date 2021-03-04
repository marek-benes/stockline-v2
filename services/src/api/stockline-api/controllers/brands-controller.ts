import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { Brand } from "../../../lib/types/brand";
import { ObjectId } from "bson";

export class BrandsController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "POST", route: "/brands", handler: this.postBrand },
            { method: "PUT", route: "/brands/:id", handler: this.putBrand },
            { method: "DELETE", route: "/brands/:id", handler: this.deleteBrand }
        ];
    }

    public postBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Add new or enable existing
        await this.context.mongo.replaceOne<Brand>(DbCollection.Brands,
            { name: req.body.name },
            { name: req.body.name, disabled: false },
            { upsert: true }
        );

        // Send response
        res.send(204);
        return next();

    };

    public putBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update or enable existing
        await this.context.mongo.updateOne<Brand>(DbCollection.Brands, new ObjectId(req.params.id),
            { $set: { name: req.body.name, disabled: false } }
        );

        // Send response
        res.send(204);
        return next();
    };

    public deleteBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update `disabled` field in document
        await this.context.mongo.updateOne<Brand>(DbCollection.Brands, new ObjectId(req.params.id),
            { $set: { disabled: true } }
        );

        // Send response
        res.send(204);
        return next();
    };

}

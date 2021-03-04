import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { Category } from "../../../lib/types/category";
import { ObjectId } from "bson";

export class CategoriesController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "POST", route: "/categories", handler: this.postCategory },
            { method: "PUT", route: "/categories/:id", handler: this.putCategory },
            { method: "DELETE", route: "/categories/:id", handler: this.deleteCategory }
        ];
    }

    public postCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Add new or enable existing
        await this.context.mongo.replaceOne<Category>(DbCollection.Categories,
            { name: req.body.name },
            { name: req.body.name, disabled: false },
            { upsert: true }
        );

        // Send response
        res.send(204);
        return next();
    };

    public putCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update or enable existing
        await this.context.mongo.updateOne<Category>(DbCollection.Categories, new ObjectId(req.params.id),
            { $set: { name: req.body.name, disabled: false } }
        );

        // Send response
        res.send(204);
        return next();
    };

    public deleteCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Update `disabled` field in document
        await this.context.mongo.updateOne<Category>(DbCollection.Categories, new ObjectId(req.params.id),
            { $set: { disabled: true } }
        );

        // Send response
        res.send(204);
        return next();
    };

}

import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { BadRequestError, UnprocessableEntityError } from "restify-errors";
import { MongoHelper } from "../../../lib/helpers/mongo-helper";
import { Category } from "../../../lib/types/category";
import { ObjectId } from "bson";

export class CategoriesController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/categories/:id", handler: this.getCategory },
            { method: "POST", route: "/categories", handler: this.postCategory },
            { method: "PUT", route: "/categories/:id", handler: this.putCategory },
            { method: "DELETE", route: "/categories/:id", handler: this.deleteCategory }
        ];
    }

    public getCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Find document
        const document = await this.context.mongo.findOne<Category>(DbCollection.Categories, new ObjectId(req.params.id));

        // Not found?
        if (!document) {
            return next(new BadRequestError());
        }

        // Send response
        res.send(200, document);

        return next();
    };

    public postCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            await this.context.mongo.replaceOne<Category>(DbCollection.Categories, {
                name: req.body.name, disabled: true
            }, { name: req.body.name, disabled: false }, { upsert: true });

            // Send response
            res.send(200);

            return next();
        }
        catch (e) {
            if (MongoHelper.isDuplicatedKeyError(e)) {
                return next(new UnprocessableEntityError("Name already in use."));
            }
            throw e;
        }
    };

    public putCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            // Replace document
            let result = await this.context.mongo.updateOne<Category>(DbCollection.Categories, new ObjectId(req.params.id), {
                $set: {
                    name: req.body.name,
                    disabled: false
                }
            });

            if (result.modifiedCount == 0) {
                return next(new BadRequestError("Category not found."));
            }

            // Send response
            res.send(200);

            return next();
        }
        catch (e) {
            if (MongoHelper.isDuplicatedKeyError(e)) {
                return next(new UnprocessableEntityError("Name already in use."));
            }

            throw e;
        }
    };

    public deleteCategory: RequestHandler = async (req: Request, res: Response, next: Next) => {
        const id = new ObjectId(req.params.id);

        // Used on the product card?
        const count = await this.context.mongo.countDocuments(DbCollection.Products, { category_id: id });
        if (count > 0) {
            // Update `disabled` field in document
            await this.context.mongo.updateOne<Category>(DbCollection.Categories, id, { $set: { disabled: true } });
        }
        else {
            // Delete document
            await this.context.mongo.deleteOne(DbCollection.Categories, id);
        }

        res.send(200);

        return next();
    };

}

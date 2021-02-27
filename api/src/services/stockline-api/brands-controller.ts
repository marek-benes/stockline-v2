import { ApiController } from "../../lib/rest/api-controller";
import { ApiRoute } from "../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../lib/mongo/types";
import { StocklineContext } from "../../lib/stockline-context";
import { BadRequestError, UnprocessableEntityError } from "restify-errors";
import { MongoHelper } from "../../lib/helpers/mongo-helper";
import { Brand } from "../../lib/types/brand";
import { ObjectId } from "bson";

export class BrandsController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/brands/:id", handler: this.getBrand },
            { method: "POST", route: "/brands", handler: this.postBrand },
            { method: "PUT", route: "/brands/:id", handler: this.putBrand },
            { method: "DELETE", route: "/brands/:id", handler: this.deleteBrand }
        ];
    }

    public getBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Find document
        const document = await this.context.mongo.findOne<Brand>(DbCollection.Brands, new ObjectId(req.params.id));

        // Not found?
        if (!document) {
            return next(new BadRequestError());
        }

        // Send response
        res.send(200, document);

        return next();
    };

    public postBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            await this.context.mongo.replaceOne<Brand>(DbCollection.Brands, {
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

    public putBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            // Replace document
            let result = await this.context.mongo.updateOne<Brand>(DbCollection.Brands, new ObjectId(req.params.id), {
                $set: {
                    name: req.body.name,
                    disabled: false
                }
            });

            if (result.modifiedCount == 0) {
                return next(new BadRequestError("Brand not found."));
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

    public deleteBrand: RequestHandler = async (req: Request, res: Response, next: Next) => {
        const id = new ObjectId(req.params.id);

        // Used on the product card?
        const count = await this.context.mongo.countDocuments(DbCollection.Products, { brand_id: id });
        if (count > 0) {
            // Update `disabled` field in document
            await this.context.mongo.updateOne<Brand>(DbCollection.Brands, id, { $set: { disabled: true } });
        }
        else {
            // Delete document
            await this.context.mongo.deleteOne(DbCollection.Brands, id);
        }

        res.send(200);

        return next();
    };

}

import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRoute } from "../../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { BadRequestError, UnprocessableEntityError } from "restify-errors";
import { MongoHelper } from "../../../lib/helpers/mongo-helper";
import { Supplier } from "../../../lib/types/supplier";
import { ObjectId } from "bson";

export class SuppliersController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/suppliers/:id", handler: this.getSupplier },
            { method: "POST", route: "/suppliers", handler: this.postSupplier },
            { method: "PUT", route: "/suppliers/:id", handler: this.putSupplier },
            { method: "DELETE", route: "/suppliers/:id", handler: this.deleteSupplier }
        ];
    }

    public getSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Find document
        const document = await this.context.mongo.findOne<Supplier>(DbCollection.Suppliers, new ObjectId(req.params.id));

        // Send response
        res.send(200, document);

        return next();
    };

    public postSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            await this.context.mongo.replaceOne<Supplier>(DbCollection.Suppliers, {
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

    public putSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Request validation
        if (!req.body?.name) {
            return next(new UnprocessableEntityError("Field `name` is required."));
        }

        try {
            // Replace document
            let result = await this.context.mongo.updateOne<Supplier>(DbCollection.Suppliers, new ObjectId(req.params.id), {
                $set: {
                    name: req.body.name,
                    disabled: false
                }
            });

            if (result.modifiedCount == 0) {
                return next(new BadRequestError("Supplier not found."));
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

    public deleteSupplier: RequestHandler = async (req: Request, res: Response, next: Next) => {
        const id = new ObjectId(req.params.id);

        // Used on the product card?
        const count = await this.context.mongo.countDocuments(DbCollection.Products, { supplier_id: id });
        if (count > 0) {
            // Update `disabled` field in document
            await this.context.mongo.updateOne<Supplier>(DbCollection.Suppliers, id, { $set: { disabled: true } });
        }
        else {
            // Delete document
            await this.context.mongo.deleteOne(DbCollection.Suppliers, id);
        }

        res.send(200);

        return next();
    };

}

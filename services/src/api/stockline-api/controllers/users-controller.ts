import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRequest, ApiRoute } from "../../../lib/rest/types";
import { Next, RequestHandler, Response } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";
import { CryptoHelper } from "../../../lib/helpers/crypto-helper";
import { DbCollection } from "../../../lib/mongo/types";
import { User } from "../../../lib/types/user";
import { StocklineContext } from "../../../lib/stockline-context";
import { ObjectId } from "bson";

export class UsersController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "POST", route: "/users", handler: this.postUser },
            { method: "PUT", route: "/users/:id", handler: this.putUser },
            { method: "DELETE", route: "/users/:id", handler: this.deleteUser }
        ];
    }

    public postUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Request validation
        if (!req.body) {
            return next(new BadRequestError(`Empty payload. Expecting JSON with mandatory user properties.`));
        }

        if (!req.body.username) {
            return next(new BadRequestError("Property `username` is required"));
        }

        if (!req.body.password) {
            return next(new BadRequestError("Property `password` is required"));
        }

        if (!req.body.name) {
            return next(new BadRequestError("Property `name` is required"));
        }

        // Create a new user
        let user = await this.context.mongo.insertOne<User>(DbCollection.Users, {
            name: req.body.name,
            username: req.body.name,
            password: CryptoHelper.hashPassword(req.body.password),
            module: req.body.module,
            disabled: false
        });

        // Remove sensitive properties
        delete user["password"];

        res.send(200, user);

        return next();
    };

    public putUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Request validation
        if (!req.body) {
            return next(new BadRequestError(`Empty payload. Expecting JSON with mandatory user properties.`));
        }

        if (!req.body.name) {
            return next(new BadRequestError("Property `name` is required"));
        }

        // Find user by ID
        let user = await this.context.mongo.findOne<User>(DbCollection.Users, req.params.id);

        // Not found?
        if (!user) {
            return next(new NotFoundError("User not found"));
        }

        // Update properties
        user.name = req.body.name;
        user.module = req.body.module;
        user.disabled = req.body.disabled;

        // Safe update user properties and return it
        await this.context.mongo.updateOne(DbCollection.Users, user.id, {
            $set: {
                name: user.name,
                module: user.module,
                disabled: user.disabled
            }
        });


        // Remove sensitive properties
        delete user["password"];
        delete user["auth"];

        res.send(200, user);

        return next();
    };

    public deleteUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        const userId = new ObjectId(req.params.id);
        await this.context.services.users.delete(userId);

        res.send(200);

        return next();
    };

}

import { ApiController } from "../../lib/rest/api-controller";
import { ApiRequest, ApiRoute } from "../../lib/rest/types";
import { Next, RequestHandler, Response } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";
import { UserStore } from "./user-store";
import { CryptoHelper } from "../../lib/helpers/crypto-helper";
import { DbCollection } from "../../lib/mongo/types";
import { User } from "../../lib/types/user";
import { StocklineContext } from "../../lib/stockline-context";

export class UsersController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/users/:id", handler: this.getUser },
            { method: "POST", route: "/users", handler: this.postUser },
            { method: "PUT", route: "/users/:id", handler: this.putUser },
            { method: "DELETE", route: "/users/:id", handler: this.deleteUser }
        ];
    }

    public getUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Find user by id
        const user = await this.context.mongo.findOne<User>(DbCollection.Users, req.params.id, { projection: { "password": 0 } });

        // Not found?
        if (user == null) {
            res.send(204);
        }
        else {
            res.send(200, user);
        }

        return next();
    };

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

        // Remove from User store
        UserStore.deleteAuthUser(user.id);

        // Remove sensitive properties
        delete user["password"];

        res.send(200, user);

        return next();
    };

    public deleteUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Delete from database
        await this.context.mongo.deleteOne(DbCollection.Users, req.params.id);

        // Remove from User store
        UserStore.deleteAuthUser(req.params.id);

        res.send(200);

        return next();
    };
}

import { Next, RequestHandler, Response } from "restify";
import { BadRequestError, UnauthorizedError } from "restify-errors";
import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRequest, ApiRoute } from "../../../lib/rest/types";
import { CryptoHelper } from "../../../lib/helpers/crypto-helper";
import { DbCollection } from "../../../lib/mongo/types";
import { User } from "../../../lib/types/user";
import { StocklineContext } from "../../../lib/stockline-context";
import { Utils } from "../../../lib/utils";

export class AuthController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/auth", handler: this.validate },
            { method: "POST", route: "/auth", handler: this.loginUser },
            { method: "DELETE", route: "/auth", handler: this.logoutUser }
        ];
    }

    // GET /auth
    public validate: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Send response
        res.send(200, {
            name: req.user.name,
            module: req.user.module
        });

        return next();
    };

    // POST /auth
    public loginUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Validate request
        if (!req.body?.username || !req.body?.password) {
            await Utils.sleep(600);
            return next(new BadRequestError(`Expecting JSON with a username and password properties.`));
        }

        // Find user by username
        let user = await this.context.mongo.findOne<User>(DbCollection.Users, { username: req.body.username });
        if (!user || !CryptoHelper.verifyPassword(req.body.password, user.password) || user.disabled) {
            await Utils.sleep(600);
            return next(new UnauthorizedError("Access denied."));
        }

        // Create user token or use existing
        let token: string;
        if (user.auth?.expiration > new Date()) {
            token = user.auth.token;
            await this.context.services.users.renewAuthToken(token);
        }
        else {
            token = await this.context.services.users.addAuthToken(user.id);
        }


        // Send response
        res.send(200, {
            token: token,
            name: user.name,
            module: user.module
        });

        return next();
    };

    public logoutUser: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Remove user from authorized users
        await this.context.services.users.deleteAuthToken(req.user.token);

        // Send response
        res.send(200);
        return next();
    };

}

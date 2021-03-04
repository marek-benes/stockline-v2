import { Next, RequestHandler, Response } from "restify";
import { BadRequestError, UnauthorizedError } from "restify-errors";
import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRequest, ApiRoute } from "../../../lib/rest/types";
import { UserStore } from "../user-store";
import { CryptoHelper } from "../../../lib/helpers/crypto-helper";
import { DbCollection } from "../../../lib/mongo/types";
import { User } from "../../../lib/types/user";
import { StocklineContext } from "../../../lib/stockline-context";

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
        // Validate
        if (!req.body) {
            return next(new BadRequestError(`Empty payload. Expecting JSON with username and password properties.`));
        }

        if (!req.body.username) {
            return next(new BadRequestError(`Username property is null`));
        }

        if (!req.body.password) {
            return next(new BadRequestError(`Password property is null`));
        }

        // Find user by username
        let user = await this.context.mongo.findOne<User>(DbCollection.Users, { username: req.body.username });

        // Not found?
        if (!user) {
            return next(new UnauthorizedError(`User with username ${req.body.username} not found`));
        }

        // Wrong password?
        if (!CryptoHelper.verifyPassword(req.body.password, user.password)) {
            return next(new UnauthorizedError(`Wrong password`));
        }

        // Disabled?
        if (user.disabled) {
            return next(new UnauthorizedError(`User with username ${req.body.username} is disabled`));
        }

        let token = UserStore.addAuthUser(user);

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
        UserStore.deleteToken(req.user.token);

        // Send response
        res.send(200);

        return next();
    };

}

import { createServer, Next, plugins, Request, RequestHandler, Response, Server } from "restify";
import { InternalServerError, NotAuthorizedError } from "restify-errors";
import { ApiController } from "./api-controller";
import { ApiRequest, ApiRoute, ApiServerOptions, ApiUser } from "./types";
import { Microservice } from "../microservice/microservice";
import { STOCKLINE_VERSION } from "../version";
import { JsonHelper } from "../helpers/json-helper";

const HEADER_SERVER = "STOCKLINE API Server";
const HEADER_AUTHORIZATION = "Authorization";

export abstract class ApiServer<T extends ApiServerOptions> extends Microservice<T> {

    // Properties
    protected readonly port: number;
    protected server: Server;
    protected endpoints: string[] = [];

    protected constructor(name: string, port: number) {
        super(name);

        this.port = port;

        // New server instance
        this.server = createServer();

        // All necessary middleware
        this.server.pre(this.enableCors);
        this.server.use(this.customHeaders);
        this.server.use(plugins.bodyParser({ reviver: JsonHelper.reviver }));
        this.server.use(plugins.queryParser());
        this.server.use(this.authorization);

        // Add common /info endpoint
        this.addRoute("GET", "/info", this.getInfo);
    }

    // Event handling methods
    public onStart(): void {
    }

    public addRoutes(routes: ApiRoute[]): void {
        // Register all routes
        for (let i = 0; i < routes.length; i++) {
            this.addRoute(routes[i].method, routes[i].route, routes[i].handler);
        }
    }

    public addRoute(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", route: string, handler: RequestHandler): void {

        // Wrap handler to new handler that catches unhandled exceptions
        const saveHandler: RequestHandler = async (req: Request, res: Response, next: Next) => {
            try {
                let start = new Date().getTime();

                // Execute handler
                let result = await handler(req, res, next);

                // Duration measurement
                let duration = new Date().getTime() - start;
                this.context.logger.d(`${method} ${req.url} (finished in ${duration}ms)`);

                // Return result
                return result;
            }
            catch (e) {
                this.context.logger.w(`Unexpected error in pipeline (${e.message})`);
                return next(new InternalServerError(e.message));
            }
        };

        // Register routes
        switch (method) {
            case "GET":
                this.server.get(route, saveHandler);
                break;
            case "POST":
                this.server.post(route, saveHandler);
                break;
            case "PUT":
                this.server.put(route, saveHandler);
                break;
            case "PATCH":
                this.server.patch(route, saveHandler);
                break;
            case "DELETE":
                this.server.del(route, saveHandler);
                break;
            default:
                this.context.logger.w(`Unknown method ${method}, route handler will be not registered`);
        }

        // Add to endpoint list (for evidence only)
        this.endpoints.push(`${method} ${route}`);
    }

    public async run(): Promise<void> {
        // Init Mongo
        await this.context.initializeMongo();

        // Run Microservice routines
        await super.run();

        // Start HTTP listener
        this.server.listen(this.port, () => {
            // Info message
            this.context.logger.i(`For more info open http://localhost:${this.port}/info in your browser`);

            // OnStart handler
            this.onStart();
        });
    }

    public debug(): void {
        this.context.logger.i(this.server.getDebugInfo());
    }

    // GET /info
    public getInfo: RequestHandler = (req: Request, res: Response, next: Next) => {
        res.send(200, {
            "api": this.constructor.name,
            "version": STOCKLINE_VERSION,
            "endpoints": this.endpoints
        });

        return next();
    };

    public authorization: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        const path = req.path();

        // Skip general endpoints
        if (path == "/info") {
            return next();
        }

        // Skip AUTH endpoint for login user
        if (path == "/auth" && req.method == "POST") {
            return next();
        }

        // Get token values from Authorization header
        const tokenValues = req.header(HEADER_AUTHORIZATION)?.split(" ");

        // Exists?
        if (!tokenValues || tokenValues.length != 2) {
            next(new NotAuthorizedError("Invalid or malformed token (expected `Basic` token within the Authorization header)"));
            return;
        }

        let user = null;

        // Find user or service based on token type
        if (tokenValues[0] == "Basic") {
            user = await this.getUser(tokenValues[1], !(path == "/auth" && req.method == "GET"));
        }
        else {
            return next(new NotAuthorizedError(`Unsupported authentication scheme ${tokenValues[0]}`));
        }

        // Token valid but user not found
        if (!user) {
            return next(new NotAuthorizedError(`User with token ${tokenValues[1]} not found`));
        }

        req.user = user;

        return next();
    };

    protected addController(controller: ApiController): void {
        this.addRoutes(controller.getRoutes());
    }

    private enableCors: RequestHandler = (req: Request, res: Response, next: Next) => {
        // CORS headers
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");

        // Only in PRE mode with OPTIONS method
        if (req.method == "OPTIONS") {
            res.send(200);
            return;
        }

        // Finish the pipeline
        return next();
    };

    private customHeaders: RequestHandler = (req: Request, res: Response, next: Next) => {
        // Remove default headers
        res.removeHeader("Server");

        // Our custom headers
        res.header("Server", HEADER_SERVER);

        return next();
    };

    private async getUser(token: string, renewToken: boolean): Promise<ApiUser | undefined> {
        // Find user by token
        let user = await this.context.services.users.findByAuthToken(token);

        // Not found?
        if (!user) {
            return;
        }

        if (renewToken) {
            await this.context.services.users.renewAuthToken(token);
        }

        // Return ApiUser
        return {
            id: user.id,
            name: user.name,
            module: user.module,
            token: token
        };
    }

}

import { ApiServer } from "../../lib/rest/api-server";
import { Next, Request, RequestHandler, Response } from "restify";
import { ApiServerOptions } from "../../lib/rest/types";
import { BadRequestError, InternalServerError } from "restify-errors";
import { MaintenanceScript } from "./maintenance-script";
import { SCRIPT_STORE } from "./script-store";
import { Utils } from "../../lib/utils";

export class MaintenanceApi extends ApiServer<ApiServerOptions> {

    private scripts: { [key: string]: MaintenanceScript } = {};

    public constructor() {
        super("Api.Maintenance", 62800);

        // Register all scripts in store
        for (let key of Object.keys(SCRIPT_STORE)) {
            const route = `/${Utils.toKebabCase(key.replace("Script", ""))}`;
            this.scripts[route] = new SCRIPT_STORE[key](this.context);
        }
        this.context.logger.i(`Registered ${Object.keys(SCRIPT_STORE).length} maintenance script(s) from store`);


        // Register all request handlers
        for (let key of Object.keys(this.scripts)) {
            // Add route handlers
            this.addRoute("POST", key, this.runScript);
        }
    }

    public runScript: RequestHandler = async (req: Request, res: Response, next: Next) => {
        try {
            const startTime = new Date().getTime();
            const route: string = <string>req.getRoute().path;

            // Find script
            let script = this.scripts[route];

            // Action execution
            await script.execute(req.body);

            this.context.logger.i(`${route} executed (${new Date().getTime() - startTime}ms)`);

            // Response 200 Ok
            res.send(200);
            return next();
        }
        catch (e) {
            if (e instanceof BadRequestError) {
                return next(e);
            }
            else {
                this.context.logger.w(`Error occurred during executing. Message: ${e.message}`);
                return next(new InternalServerError(e.message));
            }
        }
    };

}
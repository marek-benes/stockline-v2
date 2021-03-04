import { ApiController } from "../../../lib/rest/api-controller";
import { ApiRequest, ApiRoute } from "../../../lib/rest/types";
import { Next, RequestHandler, Response } from "restify";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { Receipt } from "../../../lib/types/receipt";
import { BadRequestError, InternalServerError } from "restify-errors";

export class ReceiptsController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "POST", route: "/receipts", handler: this.postReceipt },
            { method: "DELETE", route: "/receipts/:id", handler: this.deleteReceipt }
        ];
    }


    public postReceipt: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        try {
            let receipt: Receipt;

            // switch (<ReceiptType>req.query.type) {
            //     case "DeliveryNote":
            //         receipt = await this.context.services.receipts.createDeliveryNote(req.query);
            //         break;
            //     case "GoodsReceivedNote":
            //         receipt = await this.context.services.receipts.createGoodsReceivedNote(req.query);
            //         break;
            //     case "SalesReceipt":
            //         receipt = await this.context.services.receipts.createSalesReceipt(req.query);
            //         break;
            //     default:
            //         return next(new BadRequestError(`Receipt type ${req.query.type} not supported`));
            // }

            res.send(200, receipt);

            return next();
        }
        catch (e) {
            if (e instanceof BadRequestError) {
                return next(e);
            }
            else {
                this.context.logger.w(`Error occurred during receipt creating. Message: ${e.message}`);
                return next(new InternalServerError(e.message));
            }
        }

    };

    public deleteReceipt: RequestHandler = async (req: ApiRequest, res: Response, next: Next) => {
        // Check relations


        // Delete from database
        await this.context.mongo.deleteOne(DbCollection.Receipts, req.params.id);

        res.send(200);

        return next();
    };
}

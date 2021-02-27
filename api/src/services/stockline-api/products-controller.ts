import { ApiController } from "../../lib/rest/api-controller";
import { ApiRoute } from "../../lib/rest/types";
import { Next, Request, RequestHandler, Response } from "restify";
import { DbCollection } from "../../lib/mongo/types";
import { StocklineContext } from "../../lib/stockline-context";
import { Product, ProductVariant, Stock } from "../../lib/types/product";
import { ObjectId } from "bson";
import { BadRequestError } from "restify-errors";

export class ProductsController extends ApiController {

    public constructor(context: StocklineContext) {
        super(context);
    }

    public getRoutes(): ApiRoute[] {
        return [
            { method: "GET", route: "/products/:id", handler: this.getProduct }];
    }

    public getProduct: RequestHandler = async (req: Request, res: Response, next: Next) => {
        // Find document
        const product = await this.context.mongo.findOne<Product>(DbCollection.Products, new ObjectId(req.params.id));

        // Not found?
        if (!product) {
            return next(new BadRequestError());
        }

        const variants = await this.context.mongo.find<ProductVariant>(DbCollection.ProductsVariants, { product_id: product.id }, {
            sort: {
                "color": 1,
                "size": 1
            }, projection: {
                product_id: 0
            }
        });

        let result = {
            ...product,
            variants: []
        };

        for (const variant of variants) {
            // Find stock
            const stock = await this.context.mongo.find<Stock>(DbCollection.Stocks, { variant_id: variant.id }, {
                projection: {
                    variant_id: 0
                }
            });

            result.variants.push({ ...variant, stocks: stock });
            result.variants.push({ ...variant });
        }

        // Send response
        res.send(200, result);

        return next();
    };

}
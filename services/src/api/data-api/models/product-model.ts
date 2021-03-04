import { Model } from "../model";
import { StocklineContext } from "../../../lib/stockline-context";
import { Product, ProductVariant, Stock } from "../../../lib/types/product";
import { DbCollection } from "../../../lib/mongo/types";
import { ObjectId } from "bson";

export class ProductModel extends Model {

    constructor(context: StocklineContext) {
        super(context);
    }

    public async execute(queryString: any): Promise<any> {
        const productId = new ObjectId(queryString["id"]);

        // Find document
        const product = await this.context.mongo.findOne<Product>(DbCollection.Products, productId);

        // Not found?
        if (!product) {
            return;
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

        return product;
    }
}
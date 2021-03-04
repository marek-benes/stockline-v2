import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { FilterQuery, FindOneOptions } from "mongodb";
import { Dataset } from "../dataset";
import { ProductFilters } from "../../../lib/filters/product-filters";

export class ProductsDataset extends Dataset {

    constructor(context: StocklineContext) {
        super(context, DbCollection.Products);
    }

    protected buildFilterQuery(queryString: any): FilterQuery<any> {
        return ProductFilters.buildProductFilterQuery(queryString);
    }

    protected buildFindOptions(queryString: any): FindOneOptions<any> | undefined {
        return {
            ...super.buildFindOptions(queryString),
            projection: { "note": 0, "vatRate": 0, prices: 0 }
        };
    }

}

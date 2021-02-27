import { StocklineDataset } from "../../../lib/dataset/stockline-dataset";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { FilterQuery } from "mongodb";

export class StoresDataset extends StocklineDataset {

    constructor(context: StocklineContext) {
        super(context, "/stores", DbCollection.Stores);
    }

    protected buildFilterQuery(queryString: any): FilterQuery<any> {
        let filter = { $and: [] };

        // Build FilterQuery
        if (queryString["name"]) {
            filter.$and.push({ $text: { $search: queryString["name"] } });
        }

        if (queryString["type"]) {
            filter.$and.push({ "type": queryString["type"] });
        }

        if (queryString["shortcut"]) {
            filter.$and.push({ "shortcut": queryString["shortcut"] });
        }

        if (!queryString.hasOwnProperty("disabled")) {
            filter.$and.push({ disabled: { $ne: true } });
        }

        // Clean up
        if (filter.$and.length == 0) {
            delete filter.$and;
        }

        return filter;
    }

}

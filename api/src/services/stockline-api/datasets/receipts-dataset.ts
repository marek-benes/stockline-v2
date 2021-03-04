import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { FilterQuery, FindOneOptions, ObjectID } from "mongodb";
import { Dataset } from "../dataset";

export class ReceiptsDataset extends Dataset {

    constructor(context: StocklineContext) {
        super(context, DbCollection.Receipts);
    }

    protected buildFilterQuery(queryString: any): FilterQuery<any> {
        let filter = { $and: [] };

        // Build FilterQuery
        if (queryString.from) {
            filter.$and.push({ timestamp: { $gte: new Date(queryString.from) } });
        }

        if (queryString.to) {
            filter.$and.push({ timestamp: { $lt: new Date(queryString.to) } });
        }

        if (queryString["type"]) {
            filter.$and.push({ "type": { $in: queryString["type"].split(",") } });
        }

        if (queryString["number"]) {
            filter.$and.push({ "number": Number(queryString["number"]) });
        }

        if (queryString["store_id"]) {
            filter.$and.push({ "store_id": new ObjectID(queryString["store_id"]) });
        }

        if (queryString["warehouse_id"]) {
            filter.$and.push({ "warehouse_id": new ObjectID(queryString["warehouse_id"]) });
        }

        // Clean up
        if (filter.$and.length == 0) {
            delete filter.$and;
        }

        return filter;
    }

    protected buildFindOptions(queryString: any): FindOneOptions<any> | undefined {
        return {
            ...super.buildFindOptions(queryString),
            projection: { "items": 0, "note": 0 }
        };
    }

}

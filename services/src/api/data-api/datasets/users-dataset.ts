import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";
import { FilterQuery, FindOneOptions } from "mongodb";
import { Dataset } from "../dataset";

export class UsersDataset extends Dataset {

    constructor(context: StocklineContext) {
        super(context, DbCollection.Users);
    }

    protected buildFilterQuery(queryString: any): FilterQuery<any> {
        let filter = { $and: [] };

        // Build FilterQuery
        if (queryString["name"]) {
            filter.$and.push({ $text: { $search: queryString["name"] } });
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

    protected buildFindOptions(queryString: any): FindOneOptions<any> | undefined {
        return {
            ...super.buildFindOptions(queryString),
            projection: { "password": 0, "auth": 0 }
        };
    }
}

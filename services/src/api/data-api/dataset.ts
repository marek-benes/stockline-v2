import { FilterQuery, FindOneOptions } from "mongodb";
import { DbCollection } from "../../lib/mongo/types";
import { MongoHelper } from "../../lib/helpers/mongo-helper";
import { DatasetResult } from "./types";
import { StocklineContext } from "../../lib/stockline-context";

export abstract class Dataset {

    protected readonly context: StocklineContext;
    protected readonly collection?: string;

    protected constructor(context: StocklineContext, collection?: DbCollection) {
        this.context = context;
        this.collection = collection;
    }

    public async execute(queryString: any): Promise<DatasetResult> {
        // Build mongo FilterQuery from URL query string
        const filter = this.buildFilterQuery(queryString);

        // Build mongo FindOptions from URL query string
        const options = MongoHelper.buildFindOptions(queryString);

        // Get count
        let count = await this.context.mongo.countDocuments(this.collection, filter);

        // Get data
        let data = await this.context.mongo.find(this.collection, filter, options);

        return {
            page: Number(queryString.page || 1),
            pageSize: Number(queryString.pagesize) || undefined,
            total: count,
            data: data
        };
    }

    protected buildFilterQuery(queryString: any): FilterQuery<any> {
        return {};
    }

    protected buildFindOptions(queryString: any): FindOneOptions<any> | undefined {
        return MongoHelper.buildFindOptions(queryString);
    }

}
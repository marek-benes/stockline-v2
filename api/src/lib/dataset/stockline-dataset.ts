import { FilterQuery, FindOneOptions } from "mongodb";
import { DbCollection } from "../mongo/types";
import { MongoHelper } from "../helpers/mongo-helper";
import { StocklineContext } from "../stockline-context";
import { DatasetResult } from "./types";

export abstract class StocklineDataset {

    public readonly route: string;
    protected readonly context: StocklineContext;
    protected readonly collection?: string;

    protected constructor(context: StocklineContext, route: string, collection?: DbCollection) {
        this.context = context;
        this.route = route;
        this.collection = collection;
    }

    public async execute(queryString: any): Promise<DatasetResult> {
        // Build mongo FilterQuery from URL query string
        const filter = this.buildFilterQuery(queryString);

        // Build mongo FindOptions from URL query string
        const options = this.buildFindOptions(queryString);

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

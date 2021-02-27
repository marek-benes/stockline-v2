import { Collection, CollectionInsertManyOptions, CollectionInsertOneOptions, Db, DeleteWriteOpResultObject, FilterQuery, FindOneOptions, IndexOptions, MongoClient, MongoCountPreferences, ObjectId, ReplaceOneOptions, ReplaceWriteOpResult, UpdateOneOptions, UpdateQuery, UpdateWriteOpResult, WithId } from "mongodb";
import { Logger, LogLevel } from "../logger";
import { MongoOptions } from "./types";

export class Mongo {

    private readonly logger: Logger;
    private readonly options: MongoOptions;
    private readonly client: MongoClient;
    private connected: boolean = false;

    constructor(logger: Logger, options: MongoOptions) {
        this.logger = logger;
        this.options = options;

        let mongoLogger;
        let mongoLoggerLevel;

        // Register Mongo logger
        if (this.options.logger) {
            // Initialize custom Mongo logger
            switch (this.logger.level) {
                case LogLevel.Error:
                case LogLevel.Warn:
                    mongoLoggerLevel = "error";
                    break;
                case LogLevel.Info:
                    mongoLoggerLevel = "info";
                    break;
                case LogLevel.Debug:
                    mongoLoggerLevel = "debug";
                    break;
            }

            mongoLogger = function (message: string, state: { type: string; message: string; }) {
                switch (state?.type) {
                    case "debug":
                        logger.d(state?.message || message);
                        break;
                    case "error":
                        logger.e(state?.message || message);
                        break;
                    default:
                        logger.i(state?.message || message);
                        break;
                }
            };
        }

        // Create MongoClient instance
        this.client = new MongoClient(options.connectionUrl, {
            useUnifiedTopology: true,
            ignoreUndefined: true,
            logger: mongoLogger,
            loggerLevel: mongoLoggerLevel
        });
    }

    private static remapObjectId(record: any): any {
        // Null input
        if (!record) {
            return undefined;
        }

        // Array _id => id
        if (Array.isArray(record)) {
            record.forEach(x => {
                if (x["_id"]) {
                    x["id"] = x["_id"];
                    delete x["_id"];
                }
            });
        }
        // Single object _id => id
        else if (record["_id"]) {
            record["id"] = record["_id"];
            delete record["_id"];
        }

        return record;
    }

    public async connect(): Promise<void> {
        if (this.connected) {
            throw new Error("MongoDB is already connected.");
        }

        // Connect to MongoDB
        try {
            await this.client.connect();
            this.connected = true;

            this.logger.i(`Connected to ${this.options.connectionUrl} (db=${this.client.db().databaseName}, strict=${!this.options.disableStrictMode})`);
        }
        catch (e) {
            this.logger.e(`Could not connect to MongoDB (${e.message})`);
            throw new Error(`Could not connect to MongoDB (${e.message})`);
        }
    }

    public async disconnect(force?: boolean): Promise<void> {
        if (this.connected) {
            await this.client.close(force);
            this.connected = false;
        }
    }

    public database(name?: string): Db {
        // Return MongoDB database
        return this.client.db(name);
    }

    public async dropDatabase(name?: string): Promise<any> {
        return await this.client.db(name).dropDatabase();
    }

    public collection<T = any>(collection: string): Collection<T> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Return Mongo collection
        return this.client.db().collection<T>(collection);
    }

    public async dropCollection(collection: string): Promise<any> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Drop collection
        const collections = await this.client.db().collections();
        if (collections.find(x => x.collectionName == collection)) {
            return await this.client.db().collection(collection).drop();
        }
    }

    public async createIndex(collection: string, fieldOrSpec: string | any, options?: IndexOptions): Promise<string> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Create index
        return await this.client.db().collection(collection).createIndex(fieldOrSpec, options);
    }

    public async findOne<T = any>(collection: string, filter: FilterQuery<any> | ObjectId, options?: FindOneOptions<any>): Promise<T> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Execute query
        let result = await this.client.db().collection(collection).findOne<T>(filter, options);

        // Return single result
        return Mongo.remapObjectId(result);
    }

    public async find<T = any>(collection: string, query?: FilterQuery<any>, options?: FindOneOptions<any>): Promise<T[]> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Execute query
        let result = await this.client.db().collection(collection).find<T>(query || {}, options).toArray();

        // Return result as array
        return Mongo.remapObjectId(result);
    }

    public async countDocuments(collection: string, query?: FilterQuery<any>, options?: MongoCountPreferences): Promise<number> {
        // Execute query a return result
        return await this.client.db().collection(collection).countDocuments(query, options);
    }

    public async insertOne<T = any>(collection: string, doc: T, options?: CollectionInsertOneOptions): Promise<ObjectId> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Execute query
        let result = await this.client.db().collection(collection).insertOne(doc, options);

        // Return a new ID
        return result.insertedId;
    }

    public async insertMany<T = any>(collection: string, documents: T[], options?: CollectionInsertManyOptions): Promise<{ [p: number]: WithId<T>["_id"] }> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Execute query and return result
        let result = await this.client.db().collection(collection).insertMany(documents, options);

        // Return a list of new IDs
        return result.insertedIds;
    }

    public async updateOne<T = any>(collection: string, filter: FilterQuery<T> | ObjectId, update: UpdateQuery<T> | Partial<T>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Create filter query
        const filterQuery = (<ObjectId>filter).generationTime ? { _id: filter } : filter;

        // Execute query and return result
        return await this.client.db().collection(collection).updateOne(filterQuery, update, options);
    }

    public async replaceOne<T = any>(collection: string, filter: FilterQuery<T> | ObjectId, doc: T, options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Create filter query
        const filterQuery = (<ObjectId>filter).generationTime ? { _id: filter } : filter;

        // Avoid id and _id doubling
        // @ts-ignore
        delete doc["id"];

        // Execute query and return result
        return await this.client.db().collection(collection).replaceOne(filterQuery, doc, options);
    }

    public async deleteOne<T = any>(collection: string, filter: FilterQuery<T> | ObjectId): Promise<DeleteWriteOpResultObject> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Create filter query
        const filterQuery = (<ObjectId>filter).generationTime ? { _id: filter } : filter;

        // Execute query and return result
        return await this.client.db().collection(collection).deleteOne(filterQuery);
    }

    public async deleteMany<T = any>(collection: string, filter: FilterQuery<T>): Promise<DeleteWriteOpResultObject> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Execute query and return result
        return await this.client.db().collection(collection).deleteMany(filter);
    }

    public async aggregate(collection: string, match: object, group: object, sort: object): Promise<any[]> {
        // Ensure strict mode
        this.ensureStrictMode(collection);

        // Aggregate
        return this.client.db().collection(collection).aggregate([], { allowDiskUse: true }).maxTimeMS(1000000).match(match).group(group).sort(sort).toArray();
    }

    private ensureStrictMode(collection: string): void {
        if (!this.options.disableStrictMode && collection.startsWith("services.")) {
            throw new Error(`Unauthorized database access. Trying to access collection '${collection}' in strict mode.`);
        }
    }

}

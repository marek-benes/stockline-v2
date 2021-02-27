"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mongo = void 0;
const mongodb_1 = require("mongodb");
const logger_1 = require("../logger");
class Mongo {
    constructor(logger, options) {
        this.connected = false;
        this.logger = logger;
        this.options = options;
        let mongoLogger;
        let mongoLoggerLevel;
        if (this.options.logger) {
            switch (this.logger.level) {
                case logger_1.LogLevel.Error:
                case logger_1.LogLevel.Warn:
                    mongoLoggerLevel = "error";
                    break;
                case logger_1.LogLevel.Info:
                    mongoLoggerLevel = "info";
                    break;
                case logger_1.LogLevel.Debug:
                    mongoLoggerLevel = "debug";
                    break;
            }
            mongoLogger = function (message, state) {
                switch (state === null || state === void 0 ? void 0 : state.type) {
                    case "debug":
                        logger.d((state === null || state === void 0 ? void 0 : state.message) || message);
                        break;
                    case "error":
                        logger.e((state === null || state === void 0 ? void 0 : state.message) || message);
                        break;
                    default:
                        logger.i((state === null || state === void 0 ? void 0 : state.message) || message);
                        break;
                }
            };
        }
        this.client = new mongodb_1.MongoClient(options.connectionUrl, {
            useUnifiedTopology: true,
            ignoreUndefined: true,
            logger: mongoLogger,
            loggerLevel: mongoLoggerLevel
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                throw new Error("MongoDB is already connected.");
            }
            try {
                yield this.client.connect();
                this.connected = true;
                this.logger.i(`Connected to ${this.options.connectionUrl} (db=${this.client.db().databaseName}, strict=${!this.options.disableStrictMode})`);
            }
            catch (e) {
                this.logger.e(`Could not connect to MongoDB (${e.message})`);
                throw new Error(`Could not connect to MongoDB (${e.message})`);
            }
        });
    }
    disconnect(force) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                yield this.client.close(force);
                this.connected = false;
            }
        });
    }
    database(name) {
        return this.client.db(name);
    }
    dropDatabase(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.db(name).dropDatabase();
        });
    }
    collection(collection) {
        this.ensureStrictMode(collection);
        return this.client.db().collection(collection);
    }
    dropCollection(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            const collections = yield this.client.db().collections();
            if (collections.find(x => x.collectionName == collection)) {
                return yield this.client.db().collection(collection).drop();
            }
        });
    }
    createIndex(collection, fieldOrSpec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            return yield this.client.db().collection(collection).createIndex(fieldOrSpec, options);
        });
    }
    findOne(collection, filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            let result = yield this.client.db().collection(collection).findOne(filter, options);
            return Mongo.remapObjectId(result);
        });
    }
    find(collection, query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            let result = yield this.client.db().collection(collection).find(query || {}, options).toArray();
            return Mongo.remapObjectId(result);
        });
    }
    countDocuments(collection, query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.db().collection(collection).countDocuments(query, options);
        });
    }
    insertOne(collection, doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            let result = yield this.client.db().collection(collection).insertOne(doc, options);
            return result.insertedId;
        });
    }
    insertMany(collection, documents, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            let result = yield this.client.db().collection(collection).insertMany(documents, options);
            return result.insertedIds;
        });
    }
    updateOne(collection, filter, update, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            const filterQuery = filter.generationTime ? { _id: filter } : filter;
            return yield this.client.db().collection(collection).updateOne(filterQuery, update, options);
        });
    }
    replaceOne(collection, filter, doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            const filterQuery = filter.generationTime ? { _id: filter } : filter;
            delete doc["id"];
            return yield this.client.db().collection(collection).replaceOne(filterQuery, doc, options);
        });
    }
    deleteOne(collection, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            const filterQuery = filter.generationTime ? { _id: filter } : filter;
            return yield this.client.db().collection(collection).deleteOne(filterQuery);
        });
    }
    deleteMany(collection, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            return yield this.client.db().collection(collection).deleteMany(filter);
        });
    }
    aggregate(collection, match, group, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureStrictMode(collection);
            return this.client.db().collection(collection).aggregate([], { allowDiskUse: true }).maxTimeMS(1000000).match(match).group(group).sort(sort).toArray();
        });
    }
    static remapObjectId(record) {
        if (!record) {
            return undefined;
        }
        if (Array.isArray(record)) {
            record.forEach(x => {
                if (x["_id"]) {
                    x["id"] = x["_id"];
                    delete x["_id"];
                }
            });
        }
        else if (record["_id"]) {
            record["id"] = record["_id"];
            delete record["_id"];
        }
        return record;
    }
    ensureStrictMode(collection) {
        if (!this.options.disableStrictMode && collection.startsWith("services.")) {
            throw new Error(`Unauthorized database access. Trying to access collection '${collection}' in strict mode.`);
        }
    }
}
exports.Mongo = Mongo;
//# sourceMappingURL=mongo.js.map
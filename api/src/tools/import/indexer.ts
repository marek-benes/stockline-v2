import { Mongo } from "../../lib/mongo/mongo";
import { DbCollection } from "../../lib/mongo/types";

export class MongoIndexer {

    private mongo: Mongo;

    constructor(mongo: Mongo) {
        this.mongo = mongo;
    }

    public async run(dropDatabase?: boolean): Promise<void> {
        // Drop database?
        if (dropDatabase) {
            await this.mongo.dropDatabase();
        }

        await this.mongo.createIndex(DbCollection.Brands, { "disabled": 1 });
        await this.mongo.createIndex(DbCollection.Brands, { "name": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Brands, { "name": "text" });

        await this.mongo.createIndex(DbCollection.Categories, { "disabled": 1 });
        await this.mongo.createIndex(DbCollection.Categories, { "name": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Categories, { "name": "text" });

        await this.mongo.createIndex(DbCollection.Customers, { "regNo": 1 });
        await this.mongo.createIndex(DbCollection.Customers, { "vatNo": 1 });
        await this.mongo.createIndex(DbCollection.Customers, { "disabled": 1 });
        await this.mongo.createIndex(DbCollection.Customers, { "name": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Customers, { "name": "text" });

        await this.mongo.createIndex(DbCollection.Products, { "code": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Products, { "brandId": 1 });
        await this.mongo.createIndex(DbCollection.Products, { "categoryId": 1 });
        await this.mongo.createIndex(DbCollection.Products, { "supplierId": 1 });
        await this.mongo.createIndex(DbCollection.Products, { "disabled": 1 });
        await this.mongo.createIndex(DbCollection.Products, { "name": "text" });
        await this.mongo.createIndex(DbCollection.Products, { "tags": 1 });

        await this.mongo.createIndex(DbCollection.ProductsVariants, { "productId": 1 });
        await this.mongo.createIndex(DbCollection.ProductsVariants, { "barcodes": 1 }, {
            unique: true,
            partialFilterExpression: { barcodes: { $exists: true } }
        });
        await this.mongo.createIndex(DbCollection.ProductsVariants, { "disabled": 1 });

        await this.mongo.createIndex(DbCollection.Receipts, { "number": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Receipts, { "timestamp": 1 });
        await this.mongo.createIndex(DbCollection.Receipts, { "type": 1 });
        await this.mongo.createIndex(DbCollection.Receipts, { "storeId": 1 });

        await this.mongo.createIndex(DbCollection.Stores, { "name": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Stores, { "name": "text" });
        await this.mongo.createIndex(DbCollection.Stores, { "shortcut": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Stores, { "type": 1 });
        await this.mongo.createIndex(DbCollection.Stores, { "disabled": 1 });

        await this.mongo.createIndex(DbCollection.Suppliers, { "disabled": 1 });
        await this.mongo.createIndex(DbCollection.Suppliers, { "name": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Suppliers, { "name": "text" });

        await this.mongo.createIndex(DbCollection.Users, { "name": 1 });
        await this.mongo.createIndex(DbCollection.Users, { "username": 1 }, { unique: true });
        await this.mongo.createIndex(DbCollection.Users, { "disabled": 1 });
    }
}
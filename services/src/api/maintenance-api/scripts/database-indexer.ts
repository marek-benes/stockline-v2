import { MaintenanceScript } from "../maintenance-script";
import { DbCollection } from "../../../lib/mongo/types";
import { StocklineContext } from "../../../lib/stockline-context";

const SECONDS_PER_DAY = 86400;

export class DatabaseIndexer extends MaintenanceScript {

    constructor(context: StocklineContext) {
        super(context);
    }

    public getDescription(): string {
        return "This script creates missing database indexes";
    }

    public async execute(queryString: any): Promise<void> {
        await this.context.mongo.createIndex(DbCollection.Brands, { "disabled": 1 });
        await this.context.mongo.createIndex(DbCollection.Brands, { "name": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Brands, { "name": "text" });

        await this.context.mongo.createIndex(DbCollection.Categories, { "disabled": 1 });
        await this.context.mongo.createIndex(DbCollection.Categories, { "name": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Categories, { "name": "text" });

        await this.context.mongo.createIndex(DbCollection.Customers, { "regNo": 1 });
        await this.context.mongo.createIndex(DbCollection.Customers, { "vatNo": 1 });
        await this.context.mongo.createIndex(DbCollection.Customers, { "disabled": 1 });
        await this.context.mongo.createIndex(DbCollection.Customers, { "name": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Customers, { "name": "text" });

        await this.context.mongo.createIndex(DbCollection.Products, { "code": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Products, { "brandId": 1 });
        await this.context.mongo.createIndex(DbCollection.Products, { "categoryId": 1 });
        await this.context.mongo.createIndex(DbCollection.Products, { "supplierId": 1 });
        await this.context.mongo.createIndex(DbCollection.Products, { "disabled": 1 });
        await this.context.mongo.createIndex(DbCollection.Products, { "name": "text" });
        await this.context.mongo.createIndex(DbCollection.Products, { "tags": 1 });

        await this.context.mongo.createIndex(DbCollection.ProductsVariants, { "productId": 1 });
        await this.context.mongo.createIndex(DbCollection.ProductsVariants, { "barcodes": 1 }, {
            unique: true,
            partialFilterExpression: { barcodes: { $exists: true } }
        });
        await this.context.mongo.createIndex(DbCollection.ProductsVariants, { "disabled": 1 });

        await this.context.mongo.createIndex(DbCollection.Receipts, { "number": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Receipts, { "timestamp": 1 });
        await this.context.mongo.createIndex(DbCollection.Receipts, { "type": 1 });
        await this.context.mongo.createIndex(DbCollection.Receipts, { "storeId": 1 });

        await this.context.mongo.createIndex(DbCollection.Stores, { "name": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Stores, { "name": "text" });
        await this.context.mongo.createIndex(DbCollection.Stores, { "shortcut": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Stores, { "type": 1 });
        await this.context.mongo.createIndex(DbCollection.Stores, { "disabled": 1 });

        await this.context.mongo.createIndex(DbCollection.Suppliers, { "disabled": 1 });
        await this.context.mongo.createIndex(DbCollection.Suppliers, { "name": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Suppliers, { "name": "text" });

        await this.context.mongo.createIndex(DbCollection.Users, { "name": 1 });
        await this.context.mongo.createIndex(DbCollection.Users, { "username": 1 }, { unique: true });
        await this.context.mongo.createIndex(DbCollection.Users, { "disabled": 1 });
    }

}
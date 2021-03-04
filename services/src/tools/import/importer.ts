import { ConfigManager } from "../../lib/config/config-manager";
import { Logger, LogLevel } from "../../lib/logger";
import { Mongo } from "../../lib/mongo/mongo";
import { ConnectionPool, IResult } from "mssql";
import { MongoIndexer } from "./indexer";
import { DbCollection } from "../../lib/mongo/types";
import { User } from "../../lib/types/user";
import { CryptoHelper } from "../../lib/helpers/crypto-helper";
import { ObjectId } from "bson";
import { Customer } from "../../lib/types/customer";
import { Brand } from "../../lib/types/brand";
import { Supplier } from "../../lib/types/supplier";
import { Category } from "../../lib/types/category";
import { Product, ProductVariant } from "../../lib/types/product";
import { Store } from "../../lib/types/store";

const WHOLESALE_ID = 9;

export class Importer {

    private readonly mongo: Mongo;
    private readonly mssql: ConnectionPool;
    private storeLookupTableList: { id: ObjectId, sql_id: number, warehouseId: number }[];
    private customerLookupTableList: { id: ObjectId, sql_id: number }[];
    private brandLookupTableList: { id?: ObjectId, sql_id: number }[];
    private categoryLookupTableList: { id?: ObjectId, sql_id: number }[];
    private supplierLookupTableList: { id?: ObjectId, sql_id: number }[];
    private productLookupTableList: { id: ObjectId, sql_id: number, disabled: boolean }[];
    private variantLookupTableList: { id: ObjectId, sql_id: number }[];
    private wholesaleWarehouseLookupTableList: { id: ObjectId, sql_id: number }[];

    constructor() {
        // Read config
        const config = ConfigManager.readGlobalConfig();

        // Setup connection to MONGO DB server
        this.mongo = new Mongo(new Logger({ level: LogLevel.Debug }), { connectionUrl: config.context.mongoUrl });

        // Setup connection to MS SQL server
        this.mssql = new ConnectionPool({
            server: "10.101.1.15",
            database: "STOCKLINE",
            user: "stockline",
            password: "O7KoehB3Ncp0",
            options: { encrypt: false }
        });
    }

    public async run() {
        // Connect databases
        await this.mongo.connect();
        await this.mssql.connect();

        // Init mongo database
        await new MongoIndexer(this.mongo).run(true);

        // Import shops and create shop’s users
        await this.importStoresAndCreateUsers();

        // Import wholesale and warehouses
        await this.importWholesale();

        // Import wholesale customers
        await this.importWholesaleCustomers();

        // Import brands
        await this.importBrands();

        // Import categories
        await this.importCategories();

        // Import suppliers
        await this.importSuppliers();

        // Import products
        await this.importProducts();

        // Cleanup memory
        this.brandLookupTableList = undefined;
        this.categoryLookupTableList = undefined;
        this.supplierLookupTableList = undefined;

        // Import product variants
        await this.importProductVariants();

        // Import shop prices
        await this.importShopsProductPrices();

        // Import shop variant prices
        await this.importShopsProductVariantsPrices();

        // Cleanup
        await this.cleanup();

        // Disconnect databases
        await this.mssql.close();
        await this.mongo.disconnect();
    }

    private async importStoresAndCreateUsers(): Promise<void> {
        this.storeLookupTableList = [];

        // Get a list of active trade units
        let tradeUnits: IResult<any> = await this.mssql.query(`select * from TradeUnit where Type='SHOP' AND ShopType=1 AND NOT IsArchived=1 order by Name`);
        for (const x of tradeUnits.recordset) {
            let address = await this.getAddress(x.AddressId);
            let store: Store = {
                type: "Retail",
                name: x.Name,
                shortcut: x.Shortcut,
                address: address,
                eet: { premisesId: 0, registerId: 1 }
            };

            // Get default warehouse
            let warehouses: IResult<any> = await this.mssql.query(`select * from Warehouse where TradeUnitId=${x.Id} AND IsDefault=1`);
            const warehouseId = warehouses.recordset[0].Id;//.columns["Id"];

            // Insert to Mongo collection
            let objectId = await this.mongo.insertOne<Store>(DbCollection.Stores, store);

            // Add to shop list
            this.storeLookupTableList.push({ id: objectId, sql_id: x.Id, warehouseId: warehouseId });

            // Create a new shop user (auth: shortcut/1234)
            await this.mongo.insertOne<User>(DbCollection.Users, {
                name: "Prodejna " + x.Name,
                username: store.shortcut.toLowerCase(),
                password: CryptoHelper.hashPassword("1234"),
                module: objectId
            });

            // Write progress
            process.stdout.write(`Importing shops ${this.storeLookupTableList.length} / ${tradeUnits.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importWholesale(): Promise<void> {
        this.wholesaleWarehouseLookupTableList = [];

        // Get a list of active trade units
        let tradeUnits: IResult<any> = await this.mssql.query(`select * from TradeUnit where Id=${WHOLESALE_ID}`);
        for (const x of tradeUnits.recordset) {
            let address = await this.getAddress(x.AddressId);
            let store: Store = {
                type: "Wholesale",
                name: x.Name,
                shortcut: x.Shortcut,
                address: address,
                warehouses: []
            };

            // Get warehouses
            let warehouses: IResult<any> = await this.mssql.query(`select * from Warehouse where TradeUnitId=${WHOLESALE_ID}`);
            for (const y of warehouses.recordset) {

                // Check stock
                let stocks: IResult<any> = await this.mssql.query(`select COUNT(*) AS records from Stock where WarehouseId=${y.Id} AND Quantity!=0`);
                if (stocks.recordset[0].records == 0) {
                    continue;
                }

                const warehouseId = y.Id;
                const objectId = new ObjectId();

                store.warehouses.push({ id: objectId, name: y.Name });

                // Add to warehouse list
                this.wholesaleWarehouseLookupTableList.push({ id: objectId, sql_id: y.Id });

                // Write progress
                process.stdout.write(`Importing wholesale warehouses ${this.wholesaleWarehouseLookupTableList.length} / ${warehouses.recordset.length}\r`);
            }

            // Insert to Mongo collection
            let objectId = await this.mongo.insertOne<Store>(DbCollection.Stores, store);

        }

        process.stdout.write(`\r\n`);
    }

    private async importWholesaleCustomers(): Promise<void> {
        this.customerLookupTableList = [];

        let result: IResult<any> = await this.mssql.query(`select * from WholesaleCustomer`);
        for (const x of result.recordset) {
            let customer: Customer = {
                name: x.Name,
                contacts: [],
                defaults: {}
            };

            if (x.RegistrationNumber) {
                customer.regNo = x.RegistrationNumber;
            }

            if (x.VatRegistrationNumber) {
                customer.vatNo = x.vatRegistrationNumber;
            }

            if (x.ContactPerson || x.ContactPhone) {
                customer.contacts.push({
                    name: x.ContactPerson,
                    phone: x.ContactPhone
                });
            }

            if (x.AddressId) {
                customer.address = await this.getAddress(x.AddressId);
            }

            if (x.DefaultDue) {
                customer.defaults.duePeriod = x.DefaultDue;
            }

            if (x.DefaultPaymentMethod) {
                switch (x.DefaultPaymentMethod) {
                    case 1:
                        customer.defaults.paymentMethod = "Cash";
                        break;
                    case 2:
                        customer.defaults.paymentMethod = "Card";
                        break;
                    case 3:
                        customer.defaults.paymentMethod = "CashOnDelivery";
                        break;
                    case 4:
                        customer.defaults.paymentMethod = "DirectDebit";
                        break;
                }
            }

            if (x.Note) {
                customer.note = x.Note;
            }

            // Insert to Mongo collection
            let objectId = await this.mongo.insertOne<Customer>(DbCollection.Customers, customer);

            // Add to customer list
            this.customerLookupTableList.push({ id: objectId, sql_id: x.Id });

            // Write progress
            process.stdout.write(`Importing wholesale customers ${this.customerLookupTableList.length} / ${result.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importBrands(): Promise<void> {
        this.brandLookupTableList = [];

        let result: IResult<any> = await this.mssql.query(`select * from Brand ORDER BY Name`);
        for (const x of result.recordset) {
            let objectId: ObjectId;

            if (x.Name != "<nezadáno>") {
                // Insert to Mongo collection
                objectId = await this.mongo.insertOne<Brand>(DbCollection.Brands, { name: x.Name });
            }

            // Add to brand list
            this.brandLookupTableList.push({ id: objectId, sql_id: x.Id });

            // Write progress
            process.stdout.write(`Importing brands ${this.brandLookupTableList.length} / ${result.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importCategories(): Promise<void> {
        this.categoryLookupTableList = [];

        let result: IResult<any> = await this.mssql.query(`select * from Commodity ORDER BY Name`);
        for (const x of result.recordset) {
            let objectId: ObjectId;

            if (x.Name != "<nezadáno>") {
                // Insert to Mongo collection
                objectId = await this.mongo.insertOne<Category>(DbCollection.Categories, { name: x.Name });
            }

            // Add to category list
            this.categoryLookupTableList.push({ id: objectId, sql_id: x.Id });

            // Write progress
            process.stdout.write(`Importing categories ${this.categoryLookupTableList.length} / ${result.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importSuppliers(): Promise<void> {
        this.supplierLookupTableList = [];

        let result: IResult<any> = await this.mssql.query(`select * from Supplier ORDER BY Name`);
        for (const x of result.recordset) {
            let objectId: ObjectId;

            if (x.Name != "<nezadáno>") {
                // Insert to Mongo collection
                objectId = await this.mongo.insertOne<Supplier>(DbCollection.Suppliers, { name: x.Name });
            }

            // Add to supplier list
            this.supplierLookupTableList.push({ id: objectId, sql_id: x.Id });

            // Write progress
            process.stdout.write(`Importing suppliers ${this.supplierLookupTableList.length} / ${result.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importProducts(): Promise<void> {
        this.productLookupTableList = [];

        let result: IResult<any> = await this.mssql.query("select * from StockCard order by Name");
        for (const x of result.recordset) {
            let brand = this.brandLookupTableList.find(y => y.sql_id == x.BrandId);
            let category = this.categoryLookupTableList.find(y => y.sql_id == x.CommodityId);
            let supplier = this.supplierLookupTableList.find(y => y.sql_id == x.SupplierId);

            let product: Product = {
                code: x.Code,
                name: x.Name,
                note: x.Description,
                vatRate: "Standard",
                brandId: brand?.id,
                categoryId: category?.id,
                supplierId: supplier?.id
            };

            if (x.IsArchived == true) {
                product.disabled = true;
            }

            // Insert to Mongo collection
            let objectId = await this.mongo.insertOne<Product>(DbCollection.Products, product);

            // Add to products list
            this.productLookupTableList.push({ id: objectId, sql_id: x.Id, disabled: x.IsArchived });

            // Write progress
            process.stdout.write(`Importing products ${this.productLookupTableList.length} / ${result.recordset.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importProductVariants(): Promise<void> {
        let counter = 0;
        this.variantLookupTableList = [];

        for (const product of this.productLookupTableList) {
            let result: IResult<any> = await this.mssql.query(`select * from Sku where StockCardId=${product.sql_id} ORDER BY Color, Size`);
            for (const x of result.recordset) {
                // Add barcodes
                let barcodes = await this.getBarcodes(x.Id);

                let variant: ProductVariant = {
                    productId: product.id,
                    size: x.Size,
                    color: x.Color,
                    barcodes: barcodes
                };

                if (x.IsArchived == true || product.disabled == true) {
                    variant.disabled = true;
                }

                // Insert to Mongo collection
                let objectId = await this.mongo.insertOne<ProductVariant>(DbCollection.ProductsVariants, variant);

                // Add to products list
                this.variantLookupTableList.push({ id: objectId, sql_id: x.Id });
            }

            // Write progress
            process.stdout.write(`Importing product variants ${counter++} / ${this.productLookupTableList.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importShopsProductPrices(): Promise<void> {
        let count = 0;
        for (const product of this.productLookupTableList) {
            // Get product from collection
            let mongoProduct = await this.mongo.findOne<Product>(DbCollection.Products, product.id);
            if (!mongoProduct) {
                console.warn(`Product ${product.id} not found`);
                continue;
            }

            mongoProduct.prices = { shops: [] };

            for (const shop of this.storeLookupTableList) {
                let result: IResult<any> = await this.mssql.query(`select * from TradeUnitStockCardPrice where StockCardId=${product.sql_id} AND TradeUnitId=${shop.sql_id} AND PriceTypeId=1`);
                if (result.recordset.length == 0) {
                    continue;
                }
                mongoProduct.prices.shops.push({ id: shop.id, price: result.recordset[0].Price });
            }

            await this.mongo.replaceOne(DbCollection.Products, mongoProduct.id, mongoProduct);

            count++;

            // Write progress
            process.stdout.write(`Importing products prices ${count} / ${this.productLookupTableList.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async importShopsProductVariantsPrices(): Promise<void> {
        let count = 0;
        for (const variant of this.variantLookupTableList) {
            // Get variant from collection
            let mongoVariant = await this.mongo.findOne<Product>(DbCollection.ProductsVariants, variant.id);
            if (!mongoVariant) {
                console.warn(`Variant ${variant.id} not found`);
                continue;
            }

            mongoVariant.prices = { shops: [] };

            for (const shop of this.storeLookupTableList) {
                let result: IResult<any> = await this.mssql.query(`select * from TradeUnitSkuPrice where SkuId=${variant.sql_id} AND TradeUnitId=${shop.sql_id} AND PriceTypeId=1`);
                if (result.recordset.length == 0) {
                    continue;
                }
                mongoVariant.prices.shops.push({ id: shop.id, price: result.recordset[0].Price });
            }

            if (mongoVariant.prices.shops.length > 0) {
                await this.mongo.replaceOne(DbCollection.ProductsVariants, mongoVariant.id, mongoVariant);
            }

            count++;

            // Write progress
            process.stdout.write(`Importing products variants prices ${count} / ${this.variantLookupTableList.length}\r`);
        }

        process.stdout.write(`\r\n`);
    }

    private async cleanup(): Promise<void> {
        // Remove disabled variants without stock
        let variants = await this.mongo.find<ProductVariant>(DbCollection.ProductsVariants, { disabled: true });
        for (const variant of variants) {
            // Get all stocks (excluded zero)
            let count = await this.mongo.countDocuments(DbCollection.Stocks, {
                variantId: variant.id,
                quantity: { $ne: 0 }
            });
            if (count > 0) {
                continue;
            }

            // TODO: Check in the wholesale
            // TODO: Delete wholesale stock

            // Delete shops stock
            await this.mongo.deleteMany(DbCollection.Stocks, { "variant.id": variant.id });

            // Delete variant
            await this.mongo.deleteOne(DbCollection.ProductsVariants, variant.id);
            console.info(`Archived product variant ${variant.color} ${variant.size} removed.`);
        }

        // Remove all products without variants
        let products = await this.mongo.find<Product>(DbCollection.Products);
        for (const product of products) {
            let count = await this.mongo.countDocuments(DbCollection.ProductsVariants, { productId: product.id });
            if (count == 0) {
                // Delete product
                await this.mongo.deleteOne(DbCollection.Products, product.id);
                console.info(`Product  ${product.code} ${product.name} removed.`);

            }
        }

        // Remove unused brands
        let brands = await this.mongo.find(DbCollection.Brands);
        for (const brand of brands) {
            let count = await this.mongo.countDocuments(DbCollection.Products, { brandId: brand.id });
            if (count == 0) {
                await this.mongo.deleteOne(DbCollection.Brands, brand.id);
                console.info(`An unused brand ${brand.name} removed.`);
            }
        }

        // Remove unused categories
        let categories = await this.mongo.find(DbCollection.Categories);
        for (const category of categories) {
            let count = await this.mongo.countDocuments(DbCollection.Products, { categoryId: category.id });
            if (count == 0) {
                await this.mongo.deleteOne(DbCollection.Categories, category.id);
                console.info(`An unused category ${category.name} removed.`);
            }
        }

        // Remove unused suppliers
        let suppliers = await this.mongo.find(DbCollection.Suppliers);
        for (const supplier of suppliers) {
            let count = await this.mongo.countDocuments(DbCollection.Products, { supplierId: supplier.id });
            if (count == 0) {
                await this.mongo.deleteOne(DbCollection.Suppliers, supplier.id);
                console.info(`An unused supplier ${supplier.name} removed.`);
            }
        }
    }

    private async getAddress(id: number): Promise<{ street: string; city: string; zip: string; country: string; } | undefined> {
        let address: IResult<any> = await this.mssql.query(`select * from Address WHERE Id=${id}`);
        if (address.recordset.length == 0) {
            console.warn(`Address with ID ${id} not found.`);
            return undefined;
        }

        return {
            street: address.recordset[0].Street,
            city: address.recordset[0].City,
            zip: address.recordset[0].Zip,
            country: address.recordset[0].CountryCode
        };
    }

    private async getBarcodes(id: number): Promise<string[] | undefined> {
        let barcodes: string[] = [];

        let barcodesResult: IResult<any> = await this.mssql.query(`select * from Barcode where SkuId=${id}`);
        for (const x of barcodesResult.recordset) {
            if (x) {
                barcodes.push(x.Id);
            }
        }

        return barcodes.length > 0 ? barcodes : undefined;
    }

}


// Self-run
new Importer().run();
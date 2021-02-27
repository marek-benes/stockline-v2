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
exports.Importer = void 0;
const config_manager_1 = require("../../lib/config/config-manager");
const logger_1 = require("../../lib/logger");
const mongo_1 = require("../../lib/mongo/mongo");
const mssql_1 = require("mssql");
const indexer_1 = require("./indexer");
const types_1 = require("../../lib/mongo/types");
const crypto_helper_1 = require("../../lib/helpers/crypto-helper");
const bson_1 = require("bson");
const WHOLESALE_ID = 9;
class Importer {
    constructor() {
        const config = config_manager_1.ConfigManager.readGlobalConfig();
        this.mongo = new mongo_1.Mongo(new logger_1.Logger({ level: logger_1.LogLevel.Debug }), { connectionUrl: config.context.mongoUrl });
        this.mssql = new mssql_1.ConnectionPool({
            server: "10.101.1.15",
            database: "STOCKLINE",
            user: "stockline",
            password: "O7KoehB3Ncp0",
            options: { encrypt: false }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongo.connect();
            yield this.mssql.connect();
            yield new indexer_1.MongoIndexer(this.mongo).run(true);
            yield this.importStoresAndCreateUsers();
            yield this.importWholesale();
            yield this.importWholesaleCustomers();
            yield this.importBrands();
            yield this.importCategories();
            yield this.importSuppliers();
            yield this.importProducts();
            this.brandLookupTableList = undefined;
            this.categoryLookupTableList = undefined;
            this.supplierLookupTableList = undefined;
            yield this.importProductVariants();
            yield this.importShopsProductPrices();
            yield this.importShopsProductVariantsPrices();
            yield this.cleanup();
            yield this.mssql.close();
            yield this.mongo.disconnect();
        });
    }
    importStoresAndCreateUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.storeLookupTableList = [];
            let tradeUnits = yield this.mssql.query(`select * from TradeUnit where Type='SHOP' AND ShopType=1 AND NOT IsArchived=1 order by Name`);
            for (const x of tradeUnits.recordset) {
                let address = yield this.getAddress(x.AddressId);
                let store = {
                    type: "Retail",
                    name: x.Name,
                    shortcut: x.Shortcut,
                    address: address,
                    eet: { premisesId: 0, registerId: 1 },
                };
                let warehouses = yield this.mssql.query(`select * from Warehouse where TradeUnitId=${x.Id} AND IsDefault=1`);
                const warehouseId = warehouses.recordset[0].Id;
                let objectId = yield this.mongo.insertOne(types_1.DbCollection.Stores, store);
                this.storeLookupTableList.push({ id: objectId, sql_id: x.Id, warehouseId: warehouseId });
                yield this.mongo.insertOne(types_1.DbCollection.Users, {
                    name: "Prodejna " + x.Name,
                    username: store.shortcut.toLowerCase(),
                    password: crypto_helper_1.CryptoHelper.hashPassword("1234"),
                    module: objectId
                });
                process.stdout.write(`Importing shops ${this.storeLookupTableList.length} / ${tradeUnits.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importWholesale() {
        return __awaiter(this, void 0, void 0, function* () {
            this.wholesaleWarehouseLookupTableList = [];
            let tradeUnits = yield this.mssql.query(`select * from TradeUnit where Id=${WHOLESALE_ID}`);
            for (const x of tradeUnits.recordset) {
                let address = yield this.getAddress(x.AddressId);
                let store = {
                    type: "Wholesale",
                    name: x.Name,
                    shortcut: x.Shortcut,
                    address: address,
                    warehouses: []
                };
                let warehouses = yield this.mssql.query(`select * from Warehouse where TradeUnitId=${WHOLESALE_ID}`);
                for (const y of warehouses.recordset) {
                    let stocks = yield this.mssql.query(`select COUNT(*) AS records from Stock where WarehouseId=${y.Id} AND Quantity!=0`);
                    if (stocks.recordset[0].records == 0) {
                        continue;
                    }
                    const warehouseId = y.Id;
                    const objectId = new bson_1.ObjectId();
                    store.warehouses.push({ id: objectId, name: y.Name });
                    this.wholesaleWarehouseLookupTableList.push({ id: objectId, sql_id: y.Id });
                    process.stdout.write(`Importing wholesale warehouses ${this.wholesaleWarehouseLookupTableList.length} / ${warehouses.recordset.length}\r`);
                }
                let objectId = yield this.mongo.insertOne(types_1.DbCollection.Stores, store);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importWholesaleCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.customerLookupTableList = [];
            let result = yield this.mssql.query(`select * from WholesaleCustomer`);
            for (const x of result.recordset) {
                let customer = {
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
                    customer.address = yield this.getAddress(x.AddressId);
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
                let objectId = yield this.mongo.insertOne(types_1.DbCollection.Customers, customer);
                this.customerLookupTableList.push({ id: objectId, sql_id: x.Id });
                process.stdout.write(`Importing wholesale customers ${this.customerLookupTableList.length} / ${result.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.brandLookupTableList = [];
            let result = yield this.mssql.query(`select * from Brand ORDER BY Name`);
            for (const x of result.recordset) {
                let objectId;
                if (x.Name != "<nezadáno>") {
                    objectId = yield this.mongo.insertOne(types_1.DbCollection.Brands, { name: x.Name });
                }
                this.brandLookupTableList.push({ id: objectId, sql_id: x.Id });
                process.stdout.write(`Importing brands ${this.brandLookupTableList.length} / ${result.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            this.categoryLookupTableList = [];
            let result = yield this.mssql.query(`select * from Commodity ORDER BY Name`);
            for (const x of result.recordset) {
                let objectId;
                if (x.Name != "<nezadáno>") {
                    objectId = yield this.mongo.insertOne(types_1.DbCollection.Categories, { name: x.Name });
                }
                this.categoryLookupTableList.push({ id: objectId, sql_id: x.Id });
                process.stdout.write(`Importing categories ${this.categoryLookupTableList.length} / ${result.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importSuppliers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.supplierLookupTableList = [];
            let result = yield this.mssql.query(`select * from Supplier ORDER BY Name`);
            for (const x of result.recordset) {
                let objectId;
                if (x.Name != "<nezadáno>") {
                    objectId = yield this.mongo.insertOne(types_1.DbCollection.Suppliers, { name: x.Name });
                }
                this.supplierLookupTableList.push({ id: objectId, sql_id: x.Id });
                process.stdout.write(`Importing suppliers ${this.supplierLookupTableList.length} / ${result.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            this.productLookupTableList = [];
            let result = yield this.mssql.query("select * from StockCard order by Name");
            for (const x of result.recordset) {
                let brand = this.brandLookupTableList.find(y => y.sql_id == x.BrandId);
                let category = this.categoryLookupTableList.find(y => y.sql_id == x.CommodityId);
                let supplier = this.supplierLookupTableList.find(y => y.sql_id == x.SupplierId);
                let product = {
                    code: x.Code,
                    name: x.Name,
                    note: x.Description,
                    vatRate: "Standard",
                    brandId: brand === null || brand === void 0 ? void 0 : brand.id,
                    categoryId: category === null || category === void 0 ? void 0 : category.id,
                    supplierId: supplier === null || supplier === void 0 ? void 0 : supplier.id
                };
                if (x.IsArchived == true) {
                    product.disabled = true;
                }
                let objectId = yield this.mongo.insertOne(types_1.DbCollection.Products, product);
                this.productLookupTableList.push({ id: objectId, sql_id: x.Id, disabled: x.IsArchived });
                process.stdout.write(`Importing products ${this.productLookupTableList.length} / ${result.recordset.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importProductVariants() {
        return __awaiter(this, void 0, void 0, function* () {
            let counter = 0;
            this.variantLookupTableList = [];
            for (const product of this.productLookupTableList) {
                let result = yield this.mssql.query(`select * from Sku where StockCardId=${product.sql_id} ORDER BY Color, Size`);
                for (const x of result.recordset) {
                    let barcodes = yield this.getBarcodes(x.Id);
                    let variant = {
                        productId: product.id,
                        size: x.Size,
                        color: x.Color,
                        barcodes: barcodes
                    };
                    if (x.IsArchived == true || product.disabled == true) {
                        variant.disabled = true;
                    }
                    let objectId = yield this.mongo.insertOne(types_1.DbCollection.ProductsVariants, variant);
                    this.variantLookupTableList.push({ id: objectId, sql_id: x.Id });
                }
                process.stdout.write(`Importing product variants ${counter++} / ${this.productLookupTableList.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importShopsProductPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            for (const product of this.productLookupTableList) {
                let mongoProduct = yield this.mongo.findOne(types_1.DbCollection.Products, product.id);
                if (!mongoProduct) {
                    console.warn(`Product ${product.id} not found`);
                    continue;
                }
                mongoProduct.prices = { shops: [] };
                for (const shop of this.storeLookupTableList) {
                    let result = yield this.mssql.query(`select * from TradeUnitStockCardPrice where StockCardId=${product.sql_id} AND TradeUnitId=${shop.sql_id} AND PriceTypeId=1`);
                    if (result.recordset.length == 0) {
                        continue;
                    }
                    mongoProduct.prices.shops.push({ id: shop.id, price: result.recordset[0].Price });
                }
                yield this.mongo.replaceOne(types_1.DbCollection.Products, mongoProduct.id, mongoProduct);
                count++;
                process.stdout.write(`Importing products prices ${count} / ${this.productLookupTableList.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    importShopsProductVariantsPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            for (const variant of this.variantLookupTableList) {
                let mongoVariant = yield this.mongo.findOne(types_1.DbCollection.ProductsVariants, variant.id);
                if (!mongoVariant) {
                    console.warn(`Variant ${variant.id} not found`);
                    continue;
                }
                mongoVariant.prices = { shops: [] };
                for (const shop of this.storeLookupTableList) {
                    let result = yield this.mssql.query(`select * from TradeUnitSkuPrice where SkuId=${variant.sql_id} AND TradeUnitId=${shop.sql_id} AND PriceTypeId=1`);
                    if (result.recordset.length == 0) {
                        continue;
                    }
                    mongoVariant.prices.shops.push({ id: shop.id, price: result.recordset[0].Price });
                }
                if (mongoVariant.prices.shops.length > 0) {
                    yield this.mongo.replaceOne(types_1.DbCollection.ProductsVariants, mongoVariant.id, mongoVariant);
                }
                count++;
                process.stdout.write(`Importing products variants prices ${count} / ${this.variantLookupTableList.length}\r`);
            }
            process.stdout.write(`\r\n`);
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            let variants = yield this.mongo.find(types_1.DbCollection.ProductsVariants, { disabled: true });
            for (const variant of variants) {
                let count = yield this.mongo.countDocuments(types_1.DbCollection.Stocks, {
                    variantId: variant.id,
                    quantity: { $ne: 0 }
                });
                if (count > 0) {
                    continue;
                }
                yield this.mongo.deleteMany(types_1.DbCollection.Stocks, { "variant.id": variant.id });
                yield this.mongo.deleteOne(types_1.DbCollection.ProductsVariants, variant.id);
                console.info(`Archived product variant ${variant.color} ${variant.size} removed.`);
            }
            let products = yield this.mongo.find(types_1.DbCollection.Products);
            for (const product of products) {
                let count = yield this.mongo.countDocuments(types_1.DbCollection.ProductsVariants, { productId: product.id });
                if (count == 0) {
                    yield this.mongo.deleteOne(types_1.DbCollection.Products, product.id);
                    console.info(`Product  ${product.code} ${product.name} removed.`);
                }
            }
            let brands = yield this.mongo.find(types_1.DbCollection.Brands);
            for (const brand of brands) {
                let count = yield this.mongo.countDocuments(types_1.DbCollection.Products, { brandId: brand.id });
                if (count == 0) {
                    yield this.mongo.deleteOne(types_1.DbCollection.Brands, brand.id);
                    console.info(`An unused brand ${brand.name} removed.`);
                }
            }
            let categories = yield this.mongo.find(types_1.DbCollection.Categories);
            for (const category of categories) {
                let count = yield this.mongo.countDocuments(types_1.DbCollection.Products, { categoryId: category.id });
                if (count == 0) {
                    yield this.mongo.deleteOne(types_1.DbCollection.Categories, category.id);
                    console.info(`An unused category ${category.name} removed.`);
                }
            }
            let suppliers = yield this.mongo.find(types_1.DbCollection.Suppliers);
            for (const supplier of suppliers) {
                let count = yield this.mongo.countDocuments(types_1.DbCollection.Products, { supplierId: supplier.id });
                if (count == 0) {
                    yield this.mongo.deleteOne(types_1.DbCollection.Suppliers, supplier.id);
                    console.info(`An unused supplier ${supplier.name} removed.`);
                }
            }
        });
    }
    getAddress(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let address = yield this.mssql.query(`select * from Address WHERE Id=${id}`);
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
        });
    }
    getBarcodes(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let barcodes = [];
            let barcodesResult = yield this.mssql.query(`select * from Barcode where SkuId=${id}`);
            for (const x of barcodesResult.recordset) {
                if (x) {
                    barcodes.push(x.Id);
                }
            }
            return barcodes.length > 0 ? barcodes : undefined;
        });
    }
}
exports.Importer = Importer;
new Importer().run();
//# sourceMappingURL=importer.js.map
export interface MongoOptions {
    connectionUrl: string;
    disableStrictMode?: boolean;
    logger?: boolean;
}

export enum DbCollection {
    Brands = "brands",
    Categories = "categories",
    Customers = "customers",
    Journal = "journal",
    Products = "products",
    ProductsVariants = "products.variants",
    Receipts = "receipts",
    Stores = "stores",
    Stocks = "stocks",
    Suppliers = "suppliers",
    Users = "users",
}

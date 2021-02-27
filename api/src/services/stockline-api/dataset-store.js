"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.DATASET_STORE = void 0;
const brands_dataset_1 = require("./datasets/brands-dataset");
const categories_dataset_1 = require("./datasets/categories-dataset");
const customers_dataset_1 = require("./datasets/customers-dataset");
const products_dataset_1 = require("./datasets/products-dataset");
const receipts_dataset_1 = require("./datasets/receipts-dataset");
const stores_dataset_1 = require("./datasets/stores-dataset");
const suppliers_dataset_1 = require("./datasets/suppliers-dataset");
const users_dataset_1 = require("./datasets/users-dataset");
exports.DATASET_STORE = {
    BrandsDataset: brands_dataset_1.BrandsDataset,
    CategoriesDataset: categories_dataset_1.CategoriesDataset,
    CustomersDataset: customers_dataset_1.CustomersDataset,
    ProductsDataset: products_dataset_1.ProductsDataset,
    ReceiptsDataset: receipts_dataset_1.ReceiptsDataset,
    StoresDataset: stores_dataset_1.StoresDataset,
    SuppliersDataset: suppliers_dataset_1.SuppliersDataset,
    UsersDataset: users_dataset_1.UsersDataset
};
//# sourceMappingURL=dataset-store.js.map
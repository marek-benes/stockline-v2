import { BrandsDataset } from "./datasets/brands-dataset";
import { CategoriesDataset } from "./datasets/categories-dataset";
import { CustomersDataset } from "./datasets/customers-dataset";
import { ProductsDataset } from "./datasets/products-dataset";
import { ReceiptsDataset } from "./datasets/receipts-dataset";
import { StoresDataset } from "./datasets/stores-dataset";
import { SuppliersDataset } from "./datasets/suppliers-dataset";
import { UsersDataset } from "./datasets/users-dataset";
import { ProductModel } from "./models/product-model";

export const DATASET_STORE = {
    BrandsDataset,
    CategoriesDataset,
    CustomersDataset,
    ProductsDataset,
    ReceiptsDataset,
    StoresDataset,
    SuppliersDataset,
    UsersDataset
};

export const MODEL_STORE = {
    ProductModel
};
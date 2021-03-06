import { BarcodeReader } from "./components/barcodeReader/BarcodeReader";
import { Router } from "./components/router";
import { AuthClient } from "./data/clients/AuthClient";
import { BrandsClient } from "./data/clients/BrandsClient";
import { CategoriesClient } from "./data/clients/CategoriesClient";
import { CustomersClient } from "./data/clients/CustomersClient";
import { ProductsClient } from "./data/clients/ProductsClient";
import { ReceiptsClient } from "./data/clients/ReceiptsClient";
import { StoresClient } from "./data/clients/StoresClient";
import { SuppliersClient } from "./data/clients/SuppliersClient";
import { UsersClient } from "./data/clients/UsersClient";
import { IStore } from "./models/api/IStore";
import { IUser } from "./models/api/IUser";
import { IApi } from "./models/IApi";

export class AppContext {
    public router: Router;

    public user: IUser;
    public store: IStore;

    public productsClient: ProductsClient;
    public customersClient: CustomersClient;
    public brandsClient: BrandsClient;
    public categoriesClient: CategoriesClient;
    public suppliersClient: SuppliersClient;
    public storesClient: StoresClient;
    public receiptsClient: ReceiptsClient;
    public usersClient: UsersClient;

    public barcodeReader: BarcodeReader;

    constructor (api: IApi, token: string) {
        this.router = new Router();

        this.productsClient = new ProductsClient(api, token);
        this.customersClient = new CustomersClient(api, token);
        this.brandsClient = new BrandsClient(api, token);
        this.categoriesClient = new CategoriesClient(api, token);
        this.suppliersClient = new SuppliersClient(api, token);
        this.storesClient = new StoresClient(api, token);
        this.receiptsClient = new ReceiptsClient(api, token);
        this.usersClient = new UsersClient(api, token);

        this.user = AuthClient.getStoredUserInfo();
        this.storesClient.getStore(this.user.module).then(store => this.store = store);

        this.barcodeReader = new BarcodeReader();
    }
}

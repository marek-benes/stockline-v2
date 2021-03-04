import { ApiServer } from "../../lib/rest/api-server";
import { AuthController } from "./controllers/auth-controller";
import { UsersController } from "./controllers/users-controller";
import { StoresController } from "./controllers/stores-controller";
import { ProductsController } from "./controllers/products-controller";
import { CustomersController } from "./controllers/customers-controller";
import { CategoriesController } from "./controllers/categories-controller";
import { SuppliersController } from "./controllers/suppliers-controller";
import { BrandsController } from "./controllers/brands-controller";
import { ReceiptsController } from "./controllers/receipts-controller";
import { ApiServerOptions } from "../../lib/rest/types";

export class StocklineApi extends ApiServer<ApiServerOptions> {

    public constructor() {
        super("StocklineApi", 62801);

        // Add  controllers
        this.addController(new AuthController(this.context));
        this.addController(new ProductsController(this.context));
        this.addController(new UsersController(this.context));
        this.addController(new BrandsController(this.context));
        this.addController(new CategoriesController(this.context));
        this.addController(new CustomersController(this.context));
        this.addController(new ReceiptsController(this.context));
        this.addController(new StoresController(this.context));
        this.addController(new SuppliersController(this.context));
    }

}

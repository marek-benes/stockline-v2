import template from "./app.hbs";

import { AppContext } from "./AppContext";
import { Icons } from "./components/icons/Icons";
import { Route } from "./components/router";
import { AuthClient } from "./data/clients/AuthClient";
import { ScreenBase } from "./screens/ScreenBase";
import { DashboardScreen } from "./screens/shared/dashboard/DashboardScreen";
import { ProductDetailScreen } from "./screens/shared/products/product-detail/ProductDetailScreen";
import { ProductsScreen } from "./screens/shared/products/ProductsScreen";
import { VariantDetailScreen } from "./screens/shared/products/variant-detail/VariantDetailScreen";
import { UnknownScreen } from "./screens/shared/unknown/UnknownScreen";
import { ReceiptsScreen } from "./screens/shop/receipts/ReceiptsScreen";
import { SaleScreen } from "./screens/shop/sale/SaleScreen";
import { BrandsScreen } from "./screens/wholesale/brands/BrandsScreen";
import { CategoriesScreen } from "./screens/wholesale/categories/CategoriesScreen";
import { CustomerDetailScreen } from "./screens/wholesale/customers/detail/CustomerDetailScreen";
import { CustomersScreen } from "./screens/wholesale/customers/CustomersScreen";
import { SuppliersScreen } from "./screens/wholesale/suppliers/SuppliersScreen";
import { API } from "./models/IApi";

export class App {
    private context: AppContext;
    private screens: {
        dashboard?: DashboardScreen;

        sale?: SaleScreen;
        receipts?: ReceiptsScreen;

        products?: ProductsScreen;
        customers?: CustomersScreen;
        brands?: BrandsScreen;
        categories?: CategoriesScreen;
        suppliers?: SuppliersScreen;

        unknown?: UnknownScreen;
    } = {};

    private previousScreen: ScreenBase;
    private currentScreen: ScreenBase;

    private authClient: AuthClient;

    constructor (api: API) {
        this.authClient = new AuthClient(api);
        const token = AuthClient.getStoredToken();

        this.context = new AppContext(api, token);

        this.setupScreens();
        this.setupRouter();

        // User interface
        this.createUI();

        // start
        this.context.router.resolve();
    }

    private setupScreens () {
        this.screens.dashboard = new DashboardScreen(this.context);
        this.screens.unknown = new UnknownScreen(this.context);

        // if (this.context.user.module === "Wholesale") {
        this.screens.products = new ProductsScreen(this.context);
        this.screens.customers = new CustomersScreen(this.context);
        this.screens.brands = new BrandsScreen(this.context);
        this.screens.categories = new CategoriesScreen(this.context);
        this.screens.suppliers = new SuppliersScreen(this.context);
        // } else {
            // Shop
        this.screens.sale = new SaleScreen(this.context);
        this.screens.receipts = new ReceiptsScreen(this.context);
        this.screens.products = new ProductsScreen(this.context);
        // }

    }

    private setupRouter () {
        this.context.router.add(new Route("/dashboard", () => this.showScreen(this.screens.dashboard)));

        this.context.router.add(new Route("/products", () => this.showScreen(this.screens.products)));
        this.context.router.add(new Route("/products/new", () => {
            this.showScreen(new ProductDetailScreen(this.context));
            this.previousScreen = this.screens.products;
        }));
        this.context.router.add(new Route("/products/:id", (params) => {
            this.showScreen(new ProductDetailScreen(this.context, params.id));
            this.previousScreen = this.screens.products;
        }));
        this.context.router.add(new Route("/products/:id/variant/:variant", (params) => {
            this.showScreen(new VariantDetailScreen(this.context, params.id, parseInt(params.variant, 10)));
            this.previousScreen = new ProductDetailScreen(this.context, params.id);
        }));

        // if (this.context.user.module === "Wholesale") {
        this.context.router.add(new Route("/customers", () => this.showScreen(this.screens.customers)));
        this.context.router.add(new Route("/customers/new", () => {
            this.showScreen(new CustomerDetailScreen(this.context));
            this.previousScreen = this.screens.customers;
        }));
        this.context.router.add(new Route("/customers/:id", (params) => {
            this.showScreen(new CustomerDetailScreen(this.context, params.id));
            this.previousScreen = this.screens.customers;
        }));
        this.context.router.add(new Route("/brands", () => this.showScreen(this.screens.brands)));
        this.context.router.add(new Route("/categories", () => this.showScreen(this.screens.categories)));
        this.context.router.add(new Route("/suppliers", () => this.showScreen(this.screens.suppliers)));
        // } else {
        this.context.router.add(new Route("/sale", () => this.showScreen(this.screens.sale)));
        this.context.router.add(new Route("/receipts", () => this.showScreen(this.screens.receipts)));
        // }

        // default
        this.context.router.add(new Route("/", () => this.context.router.navigate("/dashboard")));
        // this.context.router.add(new Route("*", () => this.showScreen(this.screens.unknown)));
        this.context.router.add(new Route("*", () => this.context.router.navigate("/dashboard")));
    }

    private showScreen (screen: ScreenBase = this.screens.unknown) {
        this.previousScreen = this.currentScreen;
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = screen;
        screen.show();
    }

    private createUI () {
        document.body.insertAdjacentHTML("afterbegin", template({
            icons: Icons,
            screens: this.screens,
            user: this.context.user,
            isWholesale: true, // this.context.user.module === "Wholesale",
            isShop: this.context.user.module !== "Wholesale"
        }));

        document.addEventListener("toggle-sidebar", () => {
            const sidebar = document.querySelector("div#sidebar");

            if (window.innerWidth <= 900) {
                sidebar.classList.remove("hide");
                sidebar.classList.toggle("open");
            } else {
                sidebar.classList.remove("open");
                sidebar.classList.toggle("hide");
            }
        });

        document.addEventListener("previous-screen", () => {
            this.showScreen(this.previousScreen);
        });

        const logout = document.querySelector("div#user div.exit") as HTMLDivElement;
        logout.onclick = () => this.authClient.logout();
    }
}

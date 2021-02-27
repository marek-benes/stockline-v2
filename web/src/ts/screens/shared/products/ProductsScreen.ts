import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { IBrand } from "../../../models/api/IBrand";
import { ICategory } from "../../../models/api/ICategory";
import { IProduct, IProductRequest } from "../../../models/api/IProduct";
import { ISupplier } from "../../../models/api/ISupplier";
import { ScreenBase } from "../../ScreenBase";

export class ProductsScreen extends ScreenBase {
    public readonly id = "screen-products";
    public readonly title = "Produkty";

    private products: IProduct[];
    private brands: Map<string, IBrand>;
    private categories: Map<string, ICategory>;
    private suppliers: Map<string, ISupplier>;

    private table: Table;

    private page: number = 1;
    private sortProperty: string;
    private sortAscending?: boolean = false;

    public async show () {
        super.show();

        this.navbar.showSearch((text: string) => {
            if (text && this.table && this.products) {
                const t = text.toLowerCase();
                this.table.setData(this.products.filter((x) => {
                    const code = x.code?.toString().toLowerCase().indexOf(t) > -1;
                    const name = x.name?.toString().toLowerCase().indexOf(t) > -1;
                    return code || name;
                }));
            } else {
                this.table.setData(this.products);
            }
        });

        this.navbar.addFunction("function-add", "Nový produkt", Icons.Add, () => this.context.router.navigate("/products/new"));

        this.showTable();
    }

    private async showTable () {
        await this.loadData();

        this.table = new Table<IProduct>("table-products", this.products, {
            columns: [
                {
                    property: "code",
                    caption: "Kód",
                    type: "string",
                    sortable: true,
                    nowrap: true,
                    width: "120px"
                },
                {
                    property: "name",
                    caption: "Název",
                    type: "string",
                    sortable: true,
                    nowrap: true
                },
                {
                    property: "category_id",
                    caption: "Kategorie",
                    width: "180px",
                    filterOptions: Array.from(this.categories.values()).map((x) => ({ name: x.name, value: x.id })),
                    nowrap: true,
                    formatter: (id: string) => this.categories.get(id)?.name ?? "-"
                },
                {
                    property: "brand_id",
                    caption: "Značka",
                    width: "180px",
                    filterOptions: Array.from(this.brands.values()).map((x) => ({ name: x.name, value: x.id })),
                    nowrap: true,
                    formatter: (id: string) => this.brands.get(id)?.name ?? "-"
                },
                {
                    property: "supplier_id",
                    caption: "Dodavatel",
                    width: "180px",
                    filterOptions: Array.from(this.suppliers.values()).map((x) => ({ name: x.name, value: x.id })),
                    nowrap: true,
                    formatter: (id: string) => this.suppliers.get(id)?.name ?? "-"
                }
            ],
            sort: {
                property: this.sortProperty,
                ascending: this.sortAscending
            },
            pagination: {
                size: 100,
                page: this.page
            }
        });

        this.table.onRowClick = (data: IProduct) => this.context.router.navigate(`/products/${data.id}`);

        // this.table.onSort = async (key: string, ascending: boolean) => {
        //     this.sortProperty = key;
        //     this.sortAscending = ascending;

        //     await this.loadProducts();
        //     this.table.setData(this.products);
        // };

        this.table.onPageChange = (page) => this.page = page;

        this.table.show(this.content);
    }

    private async loadData () {
        this.navbar.showLoader();

        await this.loadProducts();

        if (!this.categories) {
            const categories = await this.context.categoriesClient.getCategories({
                sort: "name",
                disabled: true
            });
            this.categories = this.asMap(categories);
        }

        if (!this.brands) {
            const brands = await this.context.brandsClient.getBrands({
                sort: "name",
                disabled: true
            });
            this.brands = this.asMap(brands);
        }

        if (!this.suppliers) {
            const suppliers = await this.context.suppliersClient.getSuppliers({
                sort: "name",
                disabled: true
            });
            this.suppliers = this.asMap(suppliers);
        }

        this.navbar.hideLoader();
    }

    private async loadProducts () {
        // const query: IProductRequest = {};
        // if (this.sortProperty) {
        //     query.sort = `${this.sortProperty}${this.sortAscending ? "" : ":desc"}`;
        // }
        if (!this.products) {
            this.products = await this.context.productsClient.getProducts();
        }
    }

    private asMap<T extends { id: string; }> (data: T[]): Map<string, T> {
        return new Map<string, T>((data ?? []).map((x) => [x.id, x]));
    }
}

import template from "./product-detail.hbs";
import "./product-detail.scss";

import { AppContext } from "../../../../AppContext";
import { Confirm } from "../../../../components/confirm/Confirm";
import { Icons } from "../../../../components/icons/Icons";
import { Input } from "../../../../components/input/Input";
import { Table } from "../../../../components/table/Table";
import { IProduct } from "../../../../models/api/IProduct";
import { IProductVariant } from "../../../../models/api/IProductVariant";
import { ScreenBase } from "../../../ScreenBase";
import { IBrand } from "../../../../models/api/IBrand";
import { ISupplier } from "../../../../models/api/ISupplier";
import { ICategory } from "../../../../models/api/ICategory";
import { Select } from "../../../../components/select/select";
import { Alert } from "../../../../components/alert/Alert";

export class ProductDetailScreen extends ScreenBase {
    public readonly id = "screen-products-detail";
    public readonly title = "Produkt";

    private table: Table<IProductVariant>;

    private product: IProduct;
    private categories: ICategory[];
    private brands: IBrand[];
    private suppliers: ISupplier[];

    constructor (context: AppContext, private productId?: string) {
        super(context);
    }

    public async show () {
        super.show();

        this.navbar.showButton("back", "/products");
        if (this.productId && this.productId !== "new") {
            this.navbar.addFunction("edit", "Upravit", Icons.Edit, () => this.edit());
            this.navbar.addFunction("remove", "Smazat", Icons.Delete, () => this.remove());
        }

        await this.loadData();

        this.content.innerHTML = template({
            code: this.product?.code,
            name: this.product?.name || "&ndash;",
            note: this.product?.note || "&ndash;",

            brand: this.brands.find(x => x.id === this.product?.brand_id)?.name || "&ndash;",
            category: this.categories.find(x => x.id === this.product?.category_id)?.name || "&ndash;",
            supplier: this.suppliers.find(x => x.id === this.product?.supplier_id)?.name || "&ndash;"

            // count: this.product ? 0 : undefined, // TODO: this.variants
            // vatRate: this.getVatRateText(),
            // raw: JSON.stringify(this.product, undefined, 4)
        });

        this.table = new Table<IProductVariant>("table-product-variants", this.product?.variants, {
            columns: [
                {
                    property: "size",
                    caption: "Velikost",
                    sortable: true
                },
                {
                    property: "color",
                    caption: "Barva",
                    sortable: true
                },
                {
                    property: "count",
                    caption: "Množství",
                    sortable: true
                }
                // TODO: price for curret shop
            ],
            rowButtons: [
                {
                    id: "add-variant",
                    caption: `<span class="material-icons">${Icons.Add}</span> Přidat variantu`,
                    // TODO: add variant
                    click: () => console.log("ADD VARIANT")
                }
            ]
        });
        // this.table.onRowClick = (variant) => {
        //     // TODO: view/edit variant details
        //     console.log("EDIT:", variant);
        // };
        this.table.onRowClick = (variant, index) => this.context.router.navigate(`/products/${this.productId}/variant/${index}`);
        this.table.show(this.content.querySelector("div.variants"));

        if (!this.productId || this.productId === "new") {
            this.edit();
        }
    }

    // private getVatRateText (): string {
    //     switch (this.product?.vatRate) {
    //         case "LowerReduced": return "Druhá snížená";
    //         case "Reduced": return "První snížená";
    //         case "Standard": return "Základní";
    //         default: return "";
    //     }
    // }

    private async loadData () {
        if (this.productId && this.productId !== "new") {
            this.product = await this.context.productsClient.getProduct(this.productId);
        }
        this.categories = await this.context.categoriesClient.getCategories();
        this.brands = await this.context.brandsClient.getBrands();
        this.suppliers = await this.context.suppliersClient.getSuppliers();
    }

    private edit () {
        // create inputs
        const inputCode = new Input("code", this.product?.code, {
            label: "Kód",
            // placeholder: "Kód",
            type: "string",
            required: true
        });

        const inputName = new Input("name", this.product?.name, {
            label: "Název",
            // placeholder: "Název",
            type: "string",
            required: true
        });

        const inputDescription = new Input("description", this.product?.note, {
            label: "Popis",
            // placeholder: "Popis",
            type: "string"
        });

        const inputBrand = new Select("brand", this.product?.brand_id, {
            label: "Značka",
            options: this.brands.map(x => ({ name: x.name, value: x.id }))
            // required: true
        });

        const inputCategory = new Select("category", this.product?.category_id, {
            label: "Kategorie",
            options: this.categories.map(x => ({ name: x.name, value: x.id }))
            // required: true
        });

        const inputSupplier = new Select("supplier", this.product?.supplier_id, {
            label: "Dodavatel",
            options: this.suppliers.map(x => ({ name: x.name, value: x.id }))
            // required: true
        });

        // display created inputs
        inputCode.show(this.target.querySelector("div.general div.code"));
        inputName.show(this.target.querySelector("div.general div.name"));
        inputDescription.show(this.target.querySelector("div.general div.description"));
        inputBrand.show(this.target.querySelector("div.classification div.brand"));
        inputCategory.show(this.target.querySelector("div.classification div.category"));
        inputSupplier.show(this.target.querySelector("div.classification div.supplier"));

        // hide navbar edit button
        const editFn: HTMLDivElement = document.querySelector("div#navbar div#edit");
        if (editFn) editFn.style.display = "none";

        // display Cancel/Save buttons
        this.buttons.show();
        this.buttons.addButton({
            id: "cancel",
            caption: "cancel",
            click: () => {
                this.buttons.hide();
                this.show();
            }
        });
        this.buttons.addButton({
            id: "save",
            caption: "Uložit",
            type: "submit",
            click: async () => {
                // TODO: validate inputs
                const valid =
                    inputCode.validate() &&
                    inputName.validate() &&
                    inputDescription.validate() &&
                    inputBrand.validate() &&
                    inputCategory.validate() &&
                    inputSupplier.validate();
                if (!valid) return;

                // TODO: update product data
                const done = await this.save();

                if (done) {
                    this.show();
                    // editFn.style.display = "";
                    // buttons.classList.add("hidden");
                } else {
                    new Alert({
                        title: "Chyba",
                        type: "submit",
                        text: `Produkt se nepodařilo uložit`
                    }).show();
                }
            }
        });

        // TODO: add/edit/remove variant
    }

    private async save (): Promise<boolean> {
        // TODO: save updated Product

        return true;
    }

    private async remove () {
        new Confirm({
            title: "Odstranit",
            caption: "Odstranit",
            type: "delete",
            text: `Chcete odstranit tento produkt?`,
            result: async (result) => {
                if (result) {
                    try {
                        await this.context.productsClient.deleteProduct(this.product.id);
                    } catch (err) {
                        console.log(err); // HttpError
                    }
                    this.context.router.navigate("/products");
                }
            }
        }).show();
    }
}

import template from "./variant-detail.hbs";
import "./variant-detail.scss";

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
import { IStore } from "../../../../models/api/IStore";

export class VariantDetailScreen extends ScreenBase {
    public readonly id = "screen-products-variant-detail";
    public readonly title = "Varianta";

    private product: IProduct;
    private variant: IProductVariant;
    private stores: IStore[];

    private barcodesTable: Table<{ barcode: string }>;
    private pricesTable: Table<{ id: string, name: string, price: number }>;
    private stocksTable: Table<any>;

    constructor (context: AppContext, private productId: string, private variantIndex?: number) {
        super(context);
    }

    public async show () {
        super.show();

        this.navbar.showButton("back", `/products/${this.productId}`);
        if (this.variantIndex !== undefined) {
            this.navbar.addFunction("edit", "Upravit", Icons.Edit, () => this.edit());
            this.navbar.addFunction("remove", "Smazat", Icons.Delete, () => this.remove());
        }

        await this.loadData();

        console.log(this.product, this.variant);

        this.content.innerHTML = template({
            productCode: this.product?.code,
            productName: this.product?.name || "&ndash;",

            size: this.variant?.size,
            color: this.variant?.color
        });

        this.stocksTable = new Table("table-variant-stocks", this.getStocks(), {
            columns: [
                {
                    property: "name",
                    caption: "Obchod",
                    sortable: true,
                    width: "140px"
                }, {
                    property: "count",
                    caption: "Počet",
                    sortable: true,
                    type: "number",
                    width: "100px"
                }
            ],
            sort: {
                property: "name",
                ascending: true
            }
        });
        this.stocksTable.show(this.content.querySelector("div.stocks"));

        this.pricesTable = new Table("table-variant-prices", this.getPrices(), {
            columns: [
                {
                    property: "name",
                    caption: "Obchod",
                    sortable: true,
                    width: "140px"
                }, {
                    property: "price",
                    caption: "Cena",
                    sortable: true,
                    type: "number",
                    width: "140px"
                }
            ],
            sort: {
                property: "name",
                ascending: true
            }
        });
        this.pricesTable.show(this.content.querySelector("div.prices"));

        this.barcodesTable = new Table("table-variant-barcodes", this.variant.barcodes?.map(x => ({ barcode: x })), {
            columns: [
                {
                    property: "barcode",
                    caption: "Barkód",
                    sortable: true,
                    width: "140px"
                }
            ],
            sort: {
                property: "barcode",
                ascending: true
            },
            rowButtons: [
                {
                    id: "add-barcode",
                    caption: `<span class="material-icons">${Icons.Add}</span> Přidat barkód`,
                    // TODO: add barcode
                    click: () => console.log("ADD Barcode")
                }
            ]
        });
        this.barcodesTable.show(this.content.querySelector("div.barcodes"));

        // this.table = new Table<IProductVariant>("table-product-variants", this.product?.variants, {
        //     columns: [
        //         {
        //             property: "size",
        //             caption: "Velikost",
        //             sortable: true
        //         },
        //         {
        //             property: "color",
        //             caption: "Barva",
        //             sortable: true
        //         },
        //         {
        //             property: "count",
        //             caption: "Množství",
        //             sortable: true
        //         }
        //         // TODO: price for curret shop
        //     ],
        //     rowButtons: [
        //         {
        //             id: "add-variant",
        //             caption: `<span class="material-icons">${Icons.Add}</span> Přidat variantu`,
        //             // TODO: add variant
        //             click: () => console.log("ADD VARIANT")
        //         }
        //     ]
        // });
        // this.table.onRowClick = (variant) => {
        //     // TODO: view/edit variant details
        //     console.log("EDIT:", variant);
        // };
        // this.table.show(this.content.querySelector("div.variants"));

        // if (!this.variant) {
        //     this.edit();
        // }
    }

    private async loadData () {
        this.navbar.showLoader();
        if (this.productId && this.productId !== "new") {
            this.product = await this.context.productsClient.getProduct(this.productId);
        }
        this.stores = await this.context.storesClient.getStores();
        const variants = this.product?.variants;
        if (variants) {
            this.variant = variants[this.variantIndex];
        }
        this.navbar.hideLoader();
    }

    private getPrices (): Array<{ id: string, name: string, price: number }> {
        const prices = this.variant?.prices?.shops?.map(x => ({
            id: x.id,
            name: this.stores.find(s => s.id === x.id)?.name ?? "&ndash",
            price: x.price
        }));

        // TODO: add werehouse and product price

        return prices ?? [];
    }

    private getStocks (): any[] {
        const stocks = this.variant?.stocks;

        // TODO: unknown content of stocks

        return stocks ?? [];
    }

    private edit () {
        // create inputs
        const inputSize = new Input("code", this.variant?.size, {
            label: "Velikost",
            type: "string",
            required: true
        });
        const inputColor = new Input("code", this.variant?.color, {
            label: "Barva",
            type: "string",
            required: true
        });

        // display created inputs
        inputSize.show(this.target.querySelector("div.variant div.size"));
        inputColor.show(this.target.querySelector("div.variant div.color"));

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
                const valid =
                    inputSize.validate() &&
                    inputColor.validate();
                if (!valid) return;

                // TODO: update product data
                const done = await this.save();

                if (done) {
                    this.show();
                } else {
                    new Alert({
                        title: "Chyba",
                        type: "submit",
                        text: `Variantu se nepodařilo uložit.`
                    }).show();
                }
            }
        });
        // const buttons = this.content.querySelector("div.buttons");
        // buttons.classList.remove("hidden");
        // const cancelButton: HTMLButtonElement = this.content.querySelector("div.buttons button.cancel");
        // const submitButton: HTMLButtonElement = this.content.querySelector("div.buttons button.submit");

        // cancelButton.onclick = () => {
        //     // this.hide();
        //     this.show();
        // };

        // submitButton.onclick = async () => {
        //     const valid =
        //         inputSize.validate() &&
        //         inputColor.validate();
        //     if (!valid) return;

        //     // TODO: update product data
        //     const done = await this.save();

        //     if (done) {
        //         this.show();
        //     } else {
        //         new Alert({
        //             title: "Chyba",
        //             type: "submit",
        //             text: `Variantu se nepodařilo uložit.`
        //         }).show();
        //     }
        // };
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
                    // TODO: remove variant from product
                    // try {
                    //     await this.context.productsClient.deleteProduct(this.product.id);
                    // } catch (err) {
                    //     console.log(err); // HttpError
                    // }
                    // this.context.router.navigate(`/products/${this.product.id}`);
                }
            }
        }).show();
    }
}

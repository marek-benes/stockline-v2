import template from "./sale-screen.hbs";
import "./sale-screen.scss";

import { AppContext } from "../../../AppContext";
import { Dialog } from "../../../components/dialog/Dialog";
import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { Storage } from "../../../data/Storage";
import { IProduct, VatRate } from "../../../models/api/IProduct";
import { IProductVariant } from "../../../models/api/IProductVariant";
import { ScreenBase } from "../../ScreenBase";
import { ProductSelector } from "./product-selector/ProductSelector";
import { StoredSales } from "./stored-sales/StoredSales";

// TODO: define
export interface ISale {
    items: Array<{ product: IProduct, variant: IProductVariant }>;
}

export class SaleScreen extends ScreenBase {
    public readonly id = "screen-sale";
    public readonly title = "Prodej";
    private productsTable: Table;

    private storage: Storage<ISale> = new Storage("unfinished-sales", 2);

    private sale: ISale = {
        items: []
    };

    constructor (context: AppContext) {
        super(context);
    }

    public show () {
        super.show();

        this.navbar.title = this.title;
        this.navbar.addFunction("cancel-sale", "Smazat", Icons.Delete, () => this.cancelSale());
        this.navbar.addFunction("restore-sale", "Nedokončený prodej", Icons.Restore, () => this.restoreSale());

        this.content.innerHTML = template({
            icons: Icons
        });

        this.showProducts();
        this.showSummary();

        this.context.barcodeReader.onCode = (code: string) => {
            // TODO: load product and add it to the current sale

            // this.sale.items.push({ product, variant });
            // this.update();

            console.log("Barcode detected:", code);
        };

        return this;
    }

    public hide () {
        super.hide();
        if (this.sale?.items?.length > 0) {
            this.storage.add(this.sale);
        }

        this.context.barcodeReader.onCode = undefined;
    }

    private update () {
        this.productsTable.setData(this.sale.items.map((x) => {
            return {
                code: x.product.code,
                name: x.product.name,
                size: x.variant.size,
                color: x.variant.color,
                count: 1,

                vatRate: this.getVatRate(x.product.vatRate),
                price: this.getPrice(x.product, x.variant),

                productId: x.product.id,
                variantId: x.variant.id
            };
        }));

        // update summary
        this.showSummary();
    }

    private showProducts () {
        this.productsTable = new Table("table-products", undefined, {
            columns: [
                {
                    property: "code",
                    caption: "Kód",
                    type: "string",
                    sortable: true
                },
                {
                    property: "name",
                    caption: "Název",
                    type: "string",
                    sortable: true
                },
                {
                    property: "size",
                    caption: "Velikost",
                    type: "string"
                    // sortable: true
                },
                {
                    property: "color",
                    caption: "Barva",
                    type: "string"
                    // sortable: true
                },
                // {
                //     property: "count",
                //     caption: "Množství",
                //     type: "number",
                //     sortable: true
                // },
                {
                    property: "priceWithoutVat",
                    caption: "Cena bez DPH",
                    type: "string",
                    // sortable: true,
                    nowrap: true,
                    formatter: (_: number, d: any) => `${(d.price - (d.price * (d.vatRate / 100))).toFixed(2)} Kč`
                },
                {
                    property: "vatRate",
                    caption: "Sazba DPH",
                    type: "string",
                    // sortable: true,
                    nowrap: true,
                    formatter: (v: number) => `${v.toFixed()} %`
                },
                {
                    property: "vat",
                    caption: "DPH",
                    type: "string",
                    // sortable: true,
                    nowrap: true,
                    formatter: (_: number, d: any) => `${(d.price * (d.vatRate / 100)).toFixed(2)} Kč`
                },
                {
                    property: "price",
                    caption: "Cena",
                    type: "string",
                    // sortable: true,
                    nowrap: true,
                    formatter: (v: number) => `${v.toFixed(2)} Kč`
                },
                {
                    property: "function-remove",
                    caption: "",
                    width: "40px",
                    formatter: () => `<span class="material-icons">${Icons.Delete}</span>`
                }
            ],
            rowButtons: [
                { id: "add", caption: `<span class="material-icons">${Icons.Add}</span> Přidat`, click: () => this.addProduct() }
            ],
            sort: {
                property: "name",
                ascending: true
            }
        });

        this.productsTable.onCellClick = (data, column) => {
            if (column === "function-remove") {
                this.sale.items = this.sale.items.filter((x) => x.product.id !== data.productId || x.variant.id !== data.variantId);
                this.update();
            }
        };

        this.productsTable.show(this.content.querySelector("div.left"));
    }

    private showSummary () {
        // Cena bez DPH
        // DPH
        // Celkem
        // Discount(s) + add/remove discount
        // Total
    }

    private addProduct () {
        const selector = new ProductSelector(this.context);
        selector.onSelect = (product: IProduct, variant: IProductVariant) => {
            this.sale.items.push({ product, variant });
            this.update();
        };
        selector.show();
    }

    private cancelSale () {
        this.storage.add(this.sale);
        this.sale = { items: [] };
        this.update();
    }

    private restoreSale () {
        const dialog = new StoredSales(this.storage);
        dialog.onSelect = (sale) => {
            this.sale = sale;
            this.update();
        };
        dialog.show();
    }

    private getPrice (product: IProduct, variant: IProductVariant): number {
        const productPrice = product?.prices?.shops?.find(y => y.id === this.context.store.id);
        const variantPrice = variant?.prices?.shops?.find(y => y.id === this.context.store.id);
        return variantPrice?.price ?? productPrice?.price ?? 0;
    }

    private getVatRate (vatRate: VatRate): number {
        return {
            "Standard": 21,
            "Reduced": 15,
            "LowerReduced": 10
        }[vatRate];
    }
}

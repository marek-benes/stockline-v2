import { AppContext } from "../../../../AppContext";
import { Dialog } from "../../../../components/dialog/Dialog";
import { Table } from "../../../../components/table/Table";
import { IProduct } from "../../../../models/api/IProduct";
import { IProductVariant } from "../../../../models/api/IProductVariant";
import { VariantSelector } from "../variant-selector/VariantSelector";

import "./product-selector.scss";

export class ProductSelector extends Dialog {
    public onSelect: (product: IProduct, variant: IProductVariant) => void;

    constructor (private context: AppContext) {
        super("product-selector", {
            title: "Produkt",
            width: "800px",
            height: "600px",
            overlay: true,
            closable: true,
            search: true
        });
    }

    public async show () {
        super.show();

        this.showLoader();

        const products = await this.context.productsClient.getProducts();

        const table = new Table<IProduct>("table-products", products, {
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
                }
            ],
            sort: {
                property: "code",
                ascending: true
            },
            pagination: {
                size: 100
            }
        });

        table.onRowClick = (product: IProduct) => this.selectVariant(product);
        table.show(document.querySelector(`#${this.id} div.content`));

        this.hideLoader();

        this.onSearch = (text: string) => {
            if (text && table && products) {
                const t = text.toLowerCase();
                table.setData(products.filter((x) => {
                    const code = x.code?.toString().toLowerCase().indexOf(t) > -1;
                    const name = x.name?.toString().toLowerCase().indexOf(t) > -1;
                    return code || name;
                }));
            } else {
                table.setData(products);
            }
        };
    }

    private selectVariant (product: IProduct) {
        const variantSelector = new VariantSelector(this.context, product.id);
        variantSelector.onSelect = (p: IProduct, v: IProductVariant) => {
            if (this.onSelect) {
                this.hide();
                this.onSelect(p, v);
            }
        };
        variantSelector.show();
    }
}

import { AppContext } from "../../../../AppContext";
import { Dialog } from "../../../../components/dialog/Dialog";
import { Table } from "../../../../components/table/Table";
import { IProduct } from "../../../../models/api/IProduct";
import { IProductVariant } from "../../../../models/api/IProductVariant";

import "./variant-selector.scss";

export class VariantSelector extends Dialog {
    public onSelect: (product: IProduct, variant: IProductVariant) => void;
    public onCancel: () => void;

    constructor (private context: AppContext, private productId: string) {
        super("variant-selector", {
            title: "Varianta",
            width: "600px",
            height: "400px",
            overlay: true,
            closable: true
        });

        this.onClose = () => this.onCancel ? this.onCancel() : undefined;
    }

    public async show () {
        super.show();

        this.showLoader();

        const product = await this.context.productsClient.getProduct(this.productId);

        const table = new Table<IProductVariant>("table-products", product.variants, {
            columns: [
                {
                    property: "size",
                    caption: "Velikost",
                    type: "string",
                    sortable: true,
                    nowrap: true,
                    width: "120px"
                },
                {
                    property: "color",
                    caption: "Barva",
                    type: "string",
                    sortable: true,
                    nowrap: true
                },
                {
                    property: "price",
                    caption: "Cena",
                    type: "number",
                    width: "120px",
                    nowrap: true,
                    formatter: (_, variant: IProductVariant) => {
                        const productPrice = product?.prices?.shops?.find(x => x.id === this.context.store.id);
                        const variantPrice = variant?.prices?.shops?.find(x => x.id === this.context.store.id);
                        const price = variantPrice?.price ?? productPrice?.price;

                        return price ? `${price} Kč` : "&ndash;";
                    }
                }
            ],
            sort: {
                property: "size",
                ascending: true
            },
            pagination: {
                size: 100
            }
        });

        table.onRowClick = (variant: IProductVariant) => {
            this.hide();
            if (this.onSelect) { this.onSelect(product, variant); }
        };

        table.show(document.querySelector(`#${this.id} div.content`));

        this.hideLoader();
    }
}

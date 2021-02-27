import "./customer-detail.scss";
import template from "./customer-detail.hbs";

import { AppContext } from "../../../../AppContext";
import { Confirm } from "../../../../components/confirm/Confirm";
import { Icons } from "../../../../components/icons/Icons";
import { ICustomer } from "../../../../models/api/ICustomer";
import { ScreenBase } from "../../../ScreenBase";

export class CustomerDetailScreen extends ScreenBase {
    public readonly id = "screen-customers-detail";
    public readonly title = "Zákazník";

    private customer: ICustomer;

    constructor (context: AppContext, private customerId?: string) {
        super(context);
    }

    public async show () {
        super.show();

        await this.loadData();

        // TODO: tile 1
        // id: string;
        // name: string;
        // regNo: string;
        // vatNo: string;
        // disabled: boolean;
        // defaults: {
        //     duePeriod: number;
        //     paymentMethod: PaymentMethod;
        // };

        // TODO: tile 2
        // address: {
        //     street: string;
        //     city: string;
        //     zip: string;
        //     country: string;
        // };

        // TODO: table for contacts
        // contacts: Array<{
        //     name: string;
        //     phone: string;
        // }>;

        this.navbar.showButton("back", "/customers");
        if (this.customerId && this.customerId !== "new") {
            this.navbar.addFunction("edit", "Upravit", Icons.Edit, () => this.edit());
            this.navbar.addFunction("remove", "Smazat", Icons.Delete, () => this.remove());
        }

        // this.content.innerHTML = `<pre>${JSON.stringify(this.customer, undefined, 4)}</pre>`;
        this.content.innerHTML = template({
            general: JSON.stringify({
                id: this.customer?.id,
                name: this.customer?.name,
                regNo: this.customer?.regNo,
                vatNo: this.customer?.vatNo,
                disabled: this.customer?.disabled,
                defaults: this.customer?.defaults
            }, undefined, 4),
            address: JSON.stringify(this.customer?.address, undefined, 2) || "none",
            contacts: JSON.stringify(this.customer?.contacts, undefined, 2) || "none"
        });
    }

    private async loadData () {
        this.navbar.showLoader();
        if (this.customerId && this.customerId !== "new") {
            this.customer = await this.context.customersClient.getCustomer(this.customerId);
        }
        this.navbar.hideLoader();
    }

    private edit () {
        // TODO: add inputs, hide edit navbar button
        // TODO: show buttons (+ validate and save the data)
    }

    private remove () {
        new Confirm({
            title: "Odstranit",
            caption: "Odstranit",
            type: "delete",
            text: `Chcete odstranit tohoto zákazníka?`,
            result: async (result) => {
                if (result) {
                    try {
                        // await this.context.customersClient.deleteCustomer(this.customer.id);
                    } catch (err) {
                        console.log(err); // HttpError
                    }
                    this.context.router.navigate("/customers");
                }
            }
        }).show();
    }
}

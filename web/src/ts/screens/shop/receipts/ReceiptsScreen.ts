import "./receipts-screen.scss";

import { AppContext } from "../../../AppContext";
import { ScreenBase } from "../../ScreenBase";
import { Table } from "../../../components/table/Table";
import { IReceipt, ReceiptType } from "../../../models/api/IReceipt";
import { IStore } from "../../../models/api/IStore";
import { IUser } from "../../../models/api/IUser";
import { asDateTime } from "../../../helpers/formatters";

export class ReceiptsScreen extends ScreenBase {
    public readonly id = "screen-receipts";
    public readonly title = "Doklady";

    private table: Table<IReceipt>;

    private receipts: IReceipt[] = [];
    private stores: Map<string, IStore>;
    private users: Map<string, IUser>;

    private filter: {
        from?: string,
        to?: string,
        number?: string,
        type?: ReceiptType
        store_id?: string;
        werehouse_id?: string;
        user_id?: string;
    } = {};

    constructor (context: AppContext) {
        super(context);
    }

    public async show () {
        super.show();

        this.navbar.title = this.title;

        await this.loadData();
        this.showTable();
        this.loadReceipts();

        return this;
    }

    private showTable () {
        // TODO: receipts table

        this.table = new Table<IReceipt>("table-receipts", this.receipts, {
            pagination: {
                size: 100
            },
            columns: [
                {
                    property: "timestamp",
                    caption: "Čas",
                    sortable: true,
                    filterable: true,
                    // TODO: filter receipts by time range
                    formatter: (v: string) => asDateTime(v)
                },
                {
                    property: "number",
                    caption: "Číslo",
                    sortable: true,
                    filterable: true
                },
                {
                    property: "type",
                    caption: "Typ",
                    sortable: false,
                    filterable: true,
                    filterOptions: [
                        { value: "DeliveryNote", name: "DeliveryNote" },
                        { value: "GoodsReceivedNote", name: "GoodsReceivedNote" }
                    ]
                },
                {
                    property: "store_id",
                    caption: "Obchod",
                    filterable: true,
                    filterOptions: Array.from(this.stores).map(x => ({ value: x[0], name: x[1].name })),
                    formatter: (id: string) => {
                        const store = this.stores.get(id);
                        return store?.name ?? id ?? "";
                    }
                },
                {
                    property: "werehouse_id",
                    caption: "Sklad",
                    filterable: true,
                    filterOptions: Array.from(this.stores)
                        .reduce((s, x) => s.concat(x[1].warehouses ?? []) , [])
                        .map(x => ({ value: x.id, name: x.name })),
                    formatter: (id: string, receipt: IReceipt) => {
                        const store = this.stores.get(receipt.store_id);
                        if (store) {
                            const werehouse = store.warehouses?.find(x => x.id === id);
                            return werehouse?.name ?? id ?? "";
                        }
                        return id ?? "";
                    }
                },
                {
                    property: "user_id",
                    caption: "Uživatel",
                    filterable: true,
                    filterOptions: Array.from(this.users).map(x => ({ value: x[0], name: x[1].name })),
                    formatter: (id: string) => {
                        const user = this.users.get(id);
                        return user?.name ?? id ?? "";
                    }
                }
            ]
        });

        this.table.onRowClick = receipt => {
            console.log("row click", receipt);
        };

        this.table.onFilter = (property: string, value: string) => {
            // TODO: filter receipts
            console.log("Filter: ", property, value);
            this.filter[property] = value;

            this.loadData();
        };

        this.table.show(this.content);
    }

    private async loadData () {
        this.navbar.showLoader();

        const stores = await this.context.storesClient.getStores();
        this.stores = stores.reduce((s, x) => s.set(x.id, x), new Map());

        const users = await this.context.usersClient.getUsers();
        this.users = users.reduce((s, x) => s.set(x.id, x), new Map());

        this.navbar.hideLoader();
    }

    private async loadReceipts () {
        this.navbar.showLoader();

        this.receipts = await this.context.receiptsClient.getReceipts({
            from: this.filter.from,
            to: this.filter.to,
            type: this.filter.type,
            number: parseInt(this.filter.number, 10),
            store_id: this.filter.store_id,
            warehouse_id: this.filter.werehouse_id
        });
        this.table.setData();

        this.navbar.hideLoader();
    }
}

import moment from "moment";
import { Dialog } from "../../../../components/dialog/Dialog";
import { Icons } from "../../../../components/icons/Icons";
import { Table } from "../../../../components/table/Table";
import { Storage } from "../../../../data/Storage";
import { asDateTime } from "../../../../helpers/formatters";
import { ISale } from "../SaleScreen";

import "./stored-sales.scss";

export class StoredSales extends Dialog {
    public onSelect: (sale: ISale) => void;

    private table: Table;

    constructor (private storage: Storage<ISale>) {
        super("unfinished-sales", {
            title: "Nedokončené prodeje",
            closable: true,
            overlay: true,
            width: "800px",
            height: "600px"
        });
    }

    public show () {
        super.show();

        this.table = new Table("table-unfinished-sales", undefined, {
            columns: [
                {
                    property: "timestamp",
                    caption: "Čas",
                    sortable: true,
                    formatter: (v: string) => asDateTime(v)
                },
                {
                    property: "count",
                    caption: "Počet"
                },
                {
                    property: "items",
                    caption: "Položky"
                },
                {
                    property: "function-remove",
                    caption: "",
                    width: "40px",
                    formatter: () => `<span class="material-icons">${Icons.Delete}</span>`
                }
            ],
            sort: {
                property: "timestamp",
                ascending: false
            }
        });
        // this.table.onRowClick = (data) => {
        //     this.hide();
        //     if (this.onSelect) { this.onSelect(data.sale); }
        // };
        this.table.onCellClick = (data, column) => {
            if (column === "function-remove") {
                this.storage.remove(data.timestamp);
                this.updateTable();
            } else {
                this.hide();
                if (this.onSelect) { this.onSelect(data.sale); }
            }
        };
        this.table.show(this.dialog.querySelector("div.content"));

        this.updateTable();
    }

    private updateTable () {
        const sales = this.storage.list().map((x) => ({
            timestamp: x.timestamp,
            count: x.data.items.length,
            items: x.data.items.map((y) => y.product.name).join("<br/>"),
            sale: x.data
        }));
        this.table.setData(sales);
    }
}

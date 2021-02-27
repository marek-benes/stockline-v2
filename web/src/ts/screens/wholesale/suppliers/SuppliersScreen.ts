// import { ISupplier } from "../../models/api/ISupplier";
// import { Table } from "../../ui/Table";
// import { ScreenBase } from "../ScreenBase";

// export class SuppliersScreen extends ScreenBase {
//     public readonly id = "screen-suppliers";
//     public readonly title = "Dodavatelé";

//     private table: Table<ISupplier>;
//     private suppliers: Map<string, ISupplier>;

//     public async show () {
//         super.show();

//         this.showTable();
//     }

//     private async showTable () {
//         await this.loadData();
//         const data = Array.from(this.suppliers.values());

//         const encodedStr = (rawStr: string) => rawStr.replace(/[\u00A0-\u9999<>\&]/gim, (i) => {
//             return "&#" + i.charCodeAt(0) + ";";
//         });

//         this.table = new Table<ISupplier>("table-brands", data, {
//             columns: [
//                 {
//                     property: "name",
//                     sortable: true,
//                     filterable: true,
//                     nowrap: true,
//                     caption: "Název",
//                     formatter: encodedStr
//                 }
//             ]
//         });

//         // this.table.onRowClick = (d) => this.context.router.navigate(`/suppliers/${d.id}`);
//         this.table.onRowClick = (d) => console.log(d);

//         this.table.show(this.target);
//     }

//     private async loadData () {
//         this.suppliers = await this.context.productsClient.getSuppliers();
//     }
// }

import { Confirm } from "../../../components/confirm/Confirm";
import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { ISupplier } from "../../../models/api/ISupplier";
import { ScreenBase } from "../../ScreenBase";

import "./suppliers-screen.scss";

export class SuppliersScreen extends ScreenBase {
    public readonly id = "screen-suppliers";
    public readonly title = "Dodavatelé";

    private suppliers: ISupplier[];
    private table: Table<ISupplier>;

    private page: number = 1;
    private sortProperty: string;
    private sortAscending: boolean;

    public async show () {
        super.show();

        this.navbar.addFunction("function-add", "Nový dodavatel", Icons.Add, () => this.table.edit());

        this.showTable();

        document.addEventListener("suppliers-updated", async () => {
            await this.loadData();
            this.table.setData(this.suppliers);
        });
    }

    private async showTable () {
        await this.loadData();

        this.table = new Table<ISupplier>("table-suppliers", this.suppliers, {
            pagination: {
                size: 100,
                page: this.page
            },
            columns: [
                {
                    property: "name",
                    sortable: true,
                    nowrap: true,
                    editable: true,
                    caption: "Název",
                    formatter: (v: string) => this.encodedStr(v)
                },
                {
                    property: "function-edit",
                    caption: "",
                    width: "40px",
                    formatter: () => `<span class="material-icons">${Icons.Edit}</span>`
                },
                {
                    property: "function-remove",
                    caption: "",
                    width: "40px",
                    formatter: () => `<span class="material-icons">${Icons.Delete}</span>`
                }
            ]
        });

        this.table.onCellClick = (data, column) => {
            if (column === "function-edit") {
                this.table.edit(data.id);
            } else if (column === "function-remove") {
                this.remove(data);
            }
        };

        this.table.onSubmit = async (d) => this.save(d);

        this.table.onSort = async (p, a) => {
            this.sortProperty = p;
            this.sortAscending = a;

            await this.loadData();
            this.table.setData(this.suppliers);
        };

        // this.table.onPageChange = async (page: number) => {
        //     this.page = page;
        // };

        this.table.show(this.content);
    }

    private encodedStr = (rawStr: string) => rawStr.replace(/[\u00A0-\u9999<>\&]/gim, (i) => {
        return "&#" + i.charCodeAt(0) + ";";
    })

    private async loadData () {
        this.suppliers = await this.context.suppliersClient.getSuppliers({
            // pagesize: 100,
            // page: this.page,
            sort: this.sortProperty ? `${this.sortProperty}${this.sortAscending ? "" : ":desc"}` : undefined
        });
    }

    private async save (supplier: ISupplier) {
        try {
            if (supplier.id) {
                await this.context.suppliersClient.putSupplier({id: supplier.id, name: supplier.name});
            } else {
                await this.context.suppliersClient.postSupplier(supplier);
            }
            await this.loadData();
            this.table.setData(this.suppliers);
        } catch (e) {
            console.log(e);
        }
    }

    private async remove (supplier: ISupplier) {
        new Confirm({
            title: "Odstranit",
            caption: "Odstranit",
            type: "delete",
            text: `Chcete odstranit dodavatele <i>${this.encodedStr(supplier.name)}</i>?`,
            result: async (result) => {
                if (result) {
                    try {
                        await this.context.suppliersClient.deleteSupplier(supplier.id);
                    } catch (err) {
                        console.log(err); // HttpError
                    }
                    await this.loadData();
                    this.table.setData(this.suppliers);
                }
            }
        }).show();
    }
}

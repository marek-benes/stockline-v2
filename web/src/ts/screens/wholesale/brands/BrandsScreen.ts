import { Confirm } from "../../../components/confirm/Confirm";
import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { IBrand } from "../../../models/api/IBrand";
import { ScreenBase } from "../../ScreenBase";

import "./brands-screen.scss";

export class BrandsScreen extends ScreenBase {
    public readonly id = "screen-brands";
    public readonly title = "Značky";

    private brands: IBrand[];
    private table: Table<IBrand>;

    private page: number = 1;
    private sortProperty: string;
    private sortAscending: boolean;

    public async show () {
        super.show();

        this.navbar.addFunction("function-add", "Nová značka", Icons.Add, () => this.table.edit());

        this.showTable();

        document.addEventListener("brands-updated", async () => {
            await this.loadData();
            this.table.setData(this.brands);
        });
    }

    private async showTable () {
        await this.loadData();

        this.table = new Table<IBrand>("table-brands", this.brands, {
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
            this.table.setData(this.brands);
        };

        // this.table.onPageChange = async (page: number) => this.page = page;

        this.table.show(this.content);
    }

    private encodedStr = (rawStr: string) => rawStr.replace(/[\u00A0-\u9999<>\&]/gim, (i) => {
        return "&#" + i.charCodeAt(0) + ";";
    })

    private async loadData () {
        this.brands = await this.context.brandsClient.getBrands({
            // pagesize: 100,
            // page: this.page,
            sort: this.sortProperty ? `${this.sortProperty}${this.sortAscending ? "" : ":desc"}` : undefined
        });
    }

    private async save (brand: IBrand) {
        try {
            if (brand.id) {
                await this.context.brandsClient.putBrand({id: brand.id, name: brand.name});
            } else {
                await this.context.brandsClient.postBrand(brand);
            }
            await this.loadData();
            this.table.setData(this.brands);
        } catch (e) {
            console.log(e);
        }
    }

    private async remove (brand: IBrand) {
        new Confirm({
            title: "Odstranit",
            caption: "Odstranit",
            type: "delete",
            text: `Chcete odstranit značku <i>${this.encodedStr(brand.name)}</i>?`,
            result: async (result) => {
                if (result) {
                    try {
                        await this.context.brandsClient.deleteBrand(brand.id);
                    } catch (err) {
                        console.log(err); // HttpError
                    }
                    await this.loadData();
                    this.table.setData(this.brands);
                }
            }
        }).show();
    }
}

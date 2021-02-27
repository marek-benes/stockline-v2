import { Confirm } from "../../../components/confirm/Confirm";
import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { ICategory } from "../../../models/api/ICategory";
import { ScreenBase } from "../../ScreenBase";

import "./categories-screen.scss";

export class CategoriesScreen extends ScreenBase {
    public readonly id = "screen-categories";
    public readonly title = "Kategorie";

    private categories: ICategory[];
    private table: Table<ICategory>;

    private page: number = 1;
    private sortProperty: string;
    private sortAscending: boolean;

    public async show () {
        console.log("show categories");
        super.show();

        this.navbar.addFunction("function-add", "Nová kategorie", Icons.Add, () => this.table.edit());

        this.showTable();

        document.addEventListener("categories-updated", async () => {
            await this.loadData();
            this.table.setData(this.categories);
        });
    }

    private async showTable () {
        await this.loadData();

        this.table = new Table<ICategory>("table-categories", this.categories, {
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
            this.table.setData(this.categories);
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
        this.categories = await this.context.categoriesClient.getCategories({
            // pagesize: 100,
            // page: this.page,
            sort: this.sortProperty ? `${this.sortProperty}${this.sortAscending ? "" : ":desc"}` : undefined
        });
    }

    private async save (category: ICategory) {
        try {
            if (category.id) {
                await this.context.categoriesClient.putCategory({id: category.id, name: category.name});
            } else {
                await this.context.categoriesClient.postCategory(category);
            }
            await this.loadData();
            this.table.setData(this.categories);
        } catch (e) {
            console.log(e);
        }
    }

    private async remove (category: ICategory) {
        new Confirm({
            title: "Odstranit",
            caption: "Odstranit",
            type: "delete",
            text: `Chcete odstranit kategorii <i>${this.encodedStr(category.name)}</i>?`,
            result: async (result) => {
                if (result) {
                    try {
                        await this.context.categoriesClient.deleteCategory(category.id);
                    } catch (err) {
                        console.log(err); // HttpError
                    }
                    await this.loadData();
                    this.table.setData(this.categories);
                }
            }
        }).show();
    }
}

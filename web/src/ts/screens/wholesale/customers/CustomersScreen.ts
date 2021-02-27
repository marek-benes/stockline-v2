import { Icons } from "../../../components/icons/Icons";
import { Table } from "../../../components/table/Table";
import { ICustomer, ICustomerRequest } from "../../../models/api/ICustomer";
import { ScreenBase } from "../../ScreenBase";

export class CustomersScreen extends ScreenBase {
    public readonly id = "screen-customers";
    public readonly title = "Zákazníci";

    private customers: ICustomer[];

    private table: Table;

    private sort: string = "name";
    private sortAscending: boolean = true;

    public async show () {
        super.show();

        this.navbar.showSearch((text: string) => {
            if (text && this.table && this.customers) {
                const t = text.toLowerCase();
                this.table.setData(this.customers.filter((x) => {
                    const name = x.name?.toString().toLowerCase().indexOf(t) > -1;
                    const regNo = x.regNo?.toString().toLowerCase().indexOf(t) > -1;
                    const vatNo = x.vatNo?.toString().toLowerCase().indexOf(t) > -1;
                    return name || regNo || vatNo;
                }));
            } else {
                this.table.setData(this.customers);
            }
        });
        this.navbar.addFunction("function-add", "Nový produkt", Icons.Add, () => {
            this.context.router.navigate("/customers/new");
        });

        this.showTable();
    }

    public async showTable () {
        await this.loadData();

        this.table = new Table<ICustomer>("table-customers", this.customers, {
            columns: [
                {
                    property: "name",
                    caption: "Název",
                    sortable: true,
                    nowrap: true,
                    width: "300px"
                },
                {
                    property: "regNo",
                    caption: "IČO",
                    width: "100px"
                },
                {
                    property: "vatNo",
                    caption: "DIČ",
                    width: "100px"
                },
                {
                    property: "address",
                    caption: "Adresa",
                    formatter: (v) => this.addressFormatter(v)
                }
                // {
                //     property: "defaults.duePeriod",
                //     caption: "Doba splatnosti"
                // },
                // {
                //     property: "defaults.paymentMethod",
                //     caption: "Platební metoda"
                // }
            ]
        });

        this.table.onRowClick = (data: ICustomer) => this.context.router.navigate(`/customers/${data.id}`);
        this.table.onSort = (key: string, ascending: boolean) => {
            this.sort = key;
            this.sortAscending = ascending;
            this.loadData().then(() => this.table.setData(this.customers));
        };

        this.table.show(this.content);
    }

    public hide () {
        this.table.hide();
    }

    private async loadData () {
        this.navbar.showLoader();

        const query: ICustomerRequest = {
            limit: 100,
            disabled: true
        };
        if (this.sort) {
            query.sort = `${this.sort}${this.sortAscending ? "" : ":desc"}`;
        }
        this.customers = await this.context.customersClient.getCustomers(query);

        this.navbar.hideLoader();
    }

    private addressFormatter (v: any = {}): string {
        const parts = [
            v.street,
            [v.zip, v.city].filter((x) => x).join(" "),
            v.country
        ].filter((x) => x);

        return parts.join(", ");
    }
}

import "./table.scss";

import { IView } from "../../models/IView";
import { Icons } from "../icons/Icons";

interface ITableOptions {
    pagination?: {
        // pages?: number;
        size?: number;
        page?: number;
    };
    sort?: {
        property: string,
        ascending?: boolean
    };
    rowButtons?: Array<{ id: string, caption: string, click: () => void }>;
    columns: ITableColumn[];
}

interface ITableColumn {
    property: string;
    caption: string;
    type?: "string" | "number";
    width?: string;
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: Array<{ name: string, value: string }>;
    nowrap?: boolean;
    editable?: boolean;
    formatter?: (value: any, data: any) => string;
}

export class Table<T = any> implements IView {
    public onRowClick: (data: T, index: number, e: MouseEvent) => void;
    public onCellClick: (data: T, column: string, e: MouseEvent) => void;
    public onSort: (property: string, ascending: boolean) => void;
    public onFilter: (property: string, value: string) => void;
    public onSubmit: (data: T) => void;
    public onPageChange: (page: number) => void;

    public readonly element: HTMLDivElement;

    private sort: string;
    private sortAscending: boolean = true;

    private filter: {[key: string]: string} = {};

    constructor (public readonly id: string, private data: T[] = [], private readonly options: ITableOptions) {
        this.element = document.createElement("div");
        this.element.id = this.id;
        this.element.classList.add("table");
    }

    public show (target: HTMLElement) {
        target.appendChild(this.element);
        this.element.innerHTML = this.getHTML();

        if (this.options.sort) {
            this.sort = this.options.sort.property;
            this.sortAscending = this.options.sort.ascending;
        }

        this.setData();

    }

    public hide () {
        this.element.parentNode?.removeChild(this.element);
    }

    public setData (data?: T[]) {
        this.data = data ?? this.data;
        // if (this.options.pagination && page !== undefined && pages !== undefined) {
        //     this.options.pagination = { page, pages };
        // }

        this.renderData();

        // bind header sort click event
        this.element.querySelectorAll("thead th.sortable").forEach((cell: HTMLTableHeaderCellElement) => {
            const property = cell.getAttribute("data-property");

            cell.onclick = () => {
                if (this.sort === property) {
                    this.sortAscending = !this.sortAscending;
                } else {
                    this.sortAscending = true;
                }
                this.sort = property;

                if (this.onSort) {
                    // user will handle sort himself
                    this.onSort(this.sort, this.sortAscending);
                } else {
                    // sort here
                    this.renderData();
                }

                this.updateSortIcons();
            };
        });
        this.updateSortIcons();

        // bind filter events
        this.element.querySelectorAll("thead tr.filter input").forEach((input: HTMLInputElement) => {
            const property = input.getAttribute("data-property");
            input.onkeyup = () => {
                if (this.onFilter) {
                    // user will handle filter himself
                    this.onFilter(property, input.value);
                } else {
                    // filter here
                    if (this.filter[property] !== input.value?.toLowerCase()) {
                        this.filter[property] = input.value?.toLowerCase();
                        this.renderData();
                    }
                }
            };
        });
        this.element.querySelectorAll("thead tr.filter select").forEach((input: HTMLSelectElement) => {
            const property = input.getAttribute("data-property");
            input.onchange = () => {
                if (this.onFilter) {
                    // user will handle filter himself
                    this.onFilter(property, input.value);
                } else {
                    // filter here
                    if (this.filter[property] !== input.value?.toLowerCase()) {
                        this.filter[property] = input.value?.toLowerCase();
                        this.renderData();
                    }
                }
            };
        });
    }

    public edit (id?: string) {
        this.hideEdit();

        let data: any;
        let target: HTMLElement;
        let position: InsertPosition;

        if (id) {
            data = this.data.filter((x) => (x as any).id === id)[0];
            if (!data) { return; }
            target = this.element.querySelector(`tr[data-id="${id}"]`);
            target.classList.add("edited");
            position = "afterend";
        } else {
            data = {};
            target = this.element.querySelector(`tr.row`);
            position = "beforebegin";
        }

        const functionCount = this.options.columns.filter((x) => x.property.indexOf("function") === 0).length;
        const html = `
            <tr class="edit-inputs">
                ${this.options.columns.filter((x) => x.property.indexOf("function") !== 0).map((column, i) => `
                    <td ${i + 1 === this.options.columns.length - functionCount ? `colspan="${functionCount + 1}"` : ""}>
                        ${column.editable ? `
                            <input type="string" id="input-${column.property}" value="${data[column.property] ?? ""}" />
                        ` : ""}
                    </td>
                `).join("")}
            </tr>
            <tr class="edit-buttons">
                <td colspan="${this.options.columns.length}">
                    <button class="cancel">Zrušit</cancel>
                    <button class="submit">Uložit</cancel>
                </td>
            <tr>
        `;
        target.insertAdjacentHTML(position, html);

        const input = this.element.querySelector("tr.edit-inputs input") as HTMLInputElement;
        input.focus();

        const cancel = this.element.querySelector("tr.edit-buttons button.cancel") as HTMLButtonElement;
        const submit = this.element.querySelector("tr.edit-buttons button.submit") as HTMLButtonElement;

        cancel.onclick = () => this.hideEdit();
        submit.onclick = () => {
            this.element.querySelectorAll("tr.edit-inputs input").forEach((x: HTMLInputElement) => {
                const property = x.id.replace("input-", "");
                data[property] = x.value;
            });
            if (this.onSubmit) {
                this.onSubmit(data);
                this.hideEdit();
            }
        };
    }

    public hideEdit () {
        const row = this.element.querySelector(`tr.edited`);
        if (row) { row.classList.remove("edited"); }

        const input = this.element.querySelector("tr.edit-inputs");
        const buttons = this.element.querySelector("tr.edit-buttons");
        input?.parentElement.removeChild(input);
        buttons?.parentElement.removeChild(buttons);

    }

    private getHTML (): string {
        const filterable = this.options.columns.filter((x) => x.filterable).length > 0;

        const html = `
            <table class="${this.onRowClick ? "clickable" : ""}" cellspacing="0">
                <thead>
                    <tr>
                    ${this.options.columns.map((column) => `
                        <th
                            class="${column.sortable ? "sortable" : ""}"
                            data-property="${column.property}"
                            style="width:${column.width ?? "auto" };min-width:${column.width ?? "auto" };"
                        >${column.caption}${column.sortable ? `<span class="icon material-icons">${Icons.SwapVert}</span>` : ""}</th>
                    `).join("")}
                    </tr>
                    ${filterable ? `
                        <tr class="filter">
                        ${this.options.columns.map((column) => column.filterable ? `
                            <th>
                                ${column.filterOptions ? `
                                    <select data-property="${column.property}">
                                        <option value="">&ndash;</option>
                                        ${column.filterOptions.map((x) => `<option value="${x.value}">${x.name}</option>`).join("")}
                                    </select>
                                    <span class="material-icons">${Icons.ArrowDropDown}</span>
                                ` : `
                                    <input data-property="${column.property}" placeholder="-" />
                                    <span class="material-icons">${Icons.Search}</span>
                                `}
                            </th>
                        ` : `
                            <th></th>
                        `).join("")}
                        </tr>
                    ` : ""}
                </thead>
                <tbody></tbody>
            </table>
        `;

        return html;
    }

    private renderData () {
        let data = this.data;

        const filters: string[] = [];
        for (const i in this.filter) {
            if (!this.filter[i]) { continue; }
            filters.push(i);
        }
        if (filters.length > 0) {
            data = data.filter((x) => {
                return filters.filter((f) => x[f].toString().toLowerCase().indexOf(this.filter[f]) > -1).length > 0;
            });
        }

        if (this.sort && !this.onSort) {
            const order = this.sortAscending ? 1 : -1;
            const column = this.options.columns.filter((x) => x.property === this.sort)[0];
            if (column?.type === "string") {
                data.sort((a, b) => a[this.sort]?.trim().toLowerCase() > b[this.sort]?.trim().toLowerCase() ? 1 * order : -1 * order);
            } else {
                data.sort((a, b) => a[this.sort] > b[this.sort] ? 1 * order : -1 * order);
            }
        }

        // if (this.options.pagination && !this.onPageChange) {
        if (this.options.pagination) {
            const start = ((this.options.pagination.page ?? 1) - 1)  * this.options.pagination.size;
            data = data.slice(start, start + this.options.pagination.size);
        }

        const html = `
            ${this.getPaginationHtml()}
            ${data.length === 0 ? `
                <tr class=""><td colspan="${this.options.columns.length}">Tabulka je prázdná</td></tr>
            ` : data.map((x, i) => `
                <tr class="row" data-id="${(x as any).id ?? i}" data-index="${i}" class="${(x as any).disabled ? "disabled" : ""}">
                ${this.options.columns.map((column) => `
                    <td class="${column.nowrap ? "nowrap" : ""} ${this.onCellClick ? "clickable" : ""}" data-column="${column.property}">${this.formatValue(x, column)}</td>
                `).join("")}
                </tr>
            `).join("")}
            ${this.options.rowButtons?.map((x) => `
                <tr class="row-button" id="${x.id}">
                    <td colspan="${this.options.columns.length}">
                        <div>${x.caption}</div>
                    </td>
                </tr>
            `).join("") ?? ""}
        `;
        this.element.querySelector("tbody").innerHTML = html;

        // bind row click event
        this.element.querySelectorAll("tbody tr.row").forEach((row: HTMLTableRowElement) => {
            if (this.onRowClick) {
                row.onclick = (e) => {
                    const index = parseInt(row.getAttribute("data-index"), 10);
                    this.onRowClick(this.data[index], index, e);
                };
            }
        });

        // bind cell click event
        this.element.querySelectorAll("tbody tr.row td").forEach((cell: HTMLTableCellElement) => {
            if (this.onCellClick) {
                cell.onclick = (e) => {
                    const index = parseInt(cell.parentElement.getAttribute("data-index"), 10);
                    const column = cell.getAttribute("data-column");
                    this.onCellClick(this.data[index], column, e);

                    e.stopPropagation();
                };
            }
        });

        // bind pagination
        this.element.querySelectorAll("tbody tr.pagination span").forEach((span: HTMLSpanElement) => {
            const page = this.options.pagination.page ?? 1;
            // if (this.onPageChange) {
            //     const pages = this.options.pagination.pages;
            //     if (span.classList.contains("left")) {
            //         span.onclick = () => this.onPageChange(Math.max(page - 1, 1));
            //     } else if (span.classList.contains("page")) {
            //         span.onclick = () => this.onPageChange(parseInt(span.innerText, 10));
            //     } else if (span.classList.contains("right")) {
            //         span.onclick = () => this.onPageChange(Math.min(page + 1, pages));
            //     }
            // } else {
            if (span.classList.contains("left")) {
                span.onclick = () => {
                    this.options.pagination.page = Math.max(page - 1, 1);
                    this.renderData();
                    if (this.onPageChange) { this.onPageChange(this.options.pagination.page); }
                };
            } else if (span.classList.contains("page")) {
                span.onclick = () => {
                    this.options.pagination.page = parseInt(span.innerText, 10);
                    this.renderData();
                    if (this.onPageChange) { this.onPageChange(this.options.pagination.page); }
                };
            } else if (span.classList.contains("right")) {
                span.onclick = () => {
                    const size = this.options.pagination.size ?? 1;
                    this.options.pagination.page = Math.min(page + 1, Math.ceil((this.data.length ?? 0) / size));
                    this.renderData();
                    if (this.onPageChange) { this.onPageChange(this.options.pagination.page); }
                };
            }
            // }
        });

        this.options.rowButtons?.forEach((x) => {
            const row = this.element.querySelector(`#${x.id}`) as HTMLElement;
            row.onclick = () => x.click();
        });
    }

    private getPaginationHtml (): string {
        if (!this.options.pagination) { return ""; }

        // let pages = this.options.pagination.pages;
        const size = this.options.pagination.size;
        const page = this.options.pagination.page ?? 1;

        // if (!this.onPageChange) {
        const pages = Math.ceil((this.data?.length ?? 0) / size);
        // }

        if (pages > 1) {
            const html = `
                <tr class="pagination">
                    <td colspan="${this.options.columns.length}">
                    <div>
                        <span class="material-icons left">${Icons.ChevronLeft}</span>
                        ${this.getPageNumbers(pages, page)}

                        <span class="material-icons right">${Icons.ChevronRight}</span>
                    </div>
                    </td>
                </tr>
            `;
            return html;
        } else {
            return "";
        }
    }

    private getPageNumbers (pages: number, page: number): string {
        if (pages <= 7) {
            return new Array(pages).fill(0).map((_, i) => `<span class="page ${i + 1 === page ? "selected" : ""}">${i + 1}</span>`).join("");
        } else if (page < 3) {
            const html = `
                <span class="page ${page === 1 ? "selected" : ""}">1</span>
                <span class="page ${page === 2 ? "selected" : ""}">2</span>
                <span class="page ${page === 3 ? "selected" : ""}">3</span>
                ...
                <span class="page">${pages}</span>
            `;
            return html;
        }  else if (page > pages - 2) {
            const html = `
                <span class="page">1</span>
                ...
                <span class="page ${page === pages - 2 ? "selected" : ""}">${pages - 2}</span>
                <span class="page ${page === pages - 1 ? "selected" : ""}">${pages - 1}</span>
                <span class="page ${page === pages ? "selected" : ""}">${pages}</span>
            `;
            return html;
        } else {
            const html = `
                <span class="page">1</span>
                ${page > 3 ? "..." : ""}
                <span class="page">${page - 1}</span>
                <span class="page selected">${page}</span>
                <span class="page">${page + 1}</span>
                ${page < pages - 2 ? "..." : ""}
                <span class="page">${pages}</span>
            `;

            return html;
        }
    }

    private formatValue (data: T, column: ITableColumn): string {
        if (column.property.indexOf(".") === -1) {
            if (column.formatter) {
                return column.formatter(data[column.property], data);
            }
            return data[column.property] ?? "";
        } else {
            const keys = column.property.split(".");
            let value: any = data;
            for (const key of keys) {
                try {
                    value = value[key];
                } catch {
                    value = undefined;
                    break;
                }
            }
            if (column.formatter) {
                return column.formatter(value, data);
            }
            return value ?? "";
        }
    }

    private updateSortIcons () {
        const up = Icons.ArrowUp;
        const down = Icons.ArrowDown;
        const neutral = Icons.SwapVert;

        this.element.querySelectorAll("th.sort-descending").forEach((x) => x.classList.remove("sort-descending"));
        this.element.querySelectorAll("th span.icon.active").forEach((x) => x.classList.remove("active"));
        this.element.querySelectorAll("th span.icon").forEach((x) => x.innerHTML = neutral);

        if (this.sort) {
            this.element.querySelector(`th[data-property=${this.sort}] span.icon`).classList.add("active");
            if (!this.sortAscending) {
                this.element.querySelector(`th[data-property=${this.sort}]`).classList.add("sort-descending");
                this.element.querySelector(`th[data-property=${this.sort}] span.icon`).innerHTML = down;
            } else {
                this.element.querySelector(`th[data-property=${this.sort}] span.icon`).innerHTML = up;
            }
        }
    }
}

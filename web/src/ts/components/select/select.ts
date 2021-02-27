import template from "./select.hbs";
import "./select.scss";

interface ISelectOptions {
    label?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    options: Array<{ name: string, value: string }>;
}

export class Select {
    public input: HTMLInputElement;
    private element: HTMLDivElement;
    private message: HTMLDivElement;

    constructor (public readonly id: string, private value?: string | number, private options?: ISelectOptions) {}

    public show (target: HTMLElement) {
        target.innerHTML = "";
        target.insertAdjacentHTML("beforeend", template({
            id: this.id,

            value: this.value ?? "",
            name: this.options?.options?.find(x => x.value === this.value)?.name,

            label: this.options?.label ?? "",
            description: this.options?.description ?? "",
            placeholder: this.options?.placeholder ?? "",
            required: this.options?.required,
            options: this.options?.options
        }));

        this.input = target.querySelector(`#${this.id}`);
        this.element = this.input.parentNode as HTMLDivElement;
        this.message = this.element.querySelector("div.message");

        const dropdown: HTMLDivElement = this.element.querySelector("div.options");
        const options: NodeListOf<HTMLDivElement> = this.element.querySelectorAll("div.options div.option");

        this.input.onfocus = () => {
            dropdown.classList.add("show");
            options.forEach((e) => e.style.display = "");
        };

        this.input.onblur = () => {
            dropdown.classList.remove("show");
            if (!this.options?.required && !this.input.value) {
                this.input.dataset.value = undefined;
                return;
            }
            const selected = this.options?.options.filter((x) => x.value === this.input.dataset.value)[0];
            this.input.value = selected?.name ?? "";
            this.validate();
        };

        this.input.onkeyup = () => {
            const filter = this.input.value.toUpperCase();
            for (let i = 0; i < options.length; i++) {
                const txtValue = options[i].textContent || options[i].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    options[i].style.display = "";
                } else {
                    options[i].style.display = "none";
                }
            }
        };

        options.forEach((e) => {
            e.onmousedown = (evt) => {
                this.input.value = e.innerText;
                this.input.dataset.value = e.dataset.value ?? e.innerText;
            };
        });
    }

    public setValue (value: string) {
        const selected = this.options?.options.filter((x) => x.value === value)[0];
        if (selected) {
            this.input.value = selected.name;
            this.input.dataset.value = selected.value;
        } else {
            this.input.value = "";
            this.input.dataset.value = undefined;
        }
    }

    public getValue (): string {
        return this.input.dataset.value;
    }

    public validate (): boolean {
        if (this.options.required && !this.input.value) {
            this.setValidationMessage("Toto pole je povinné");
            return false;
        }

        this.setValidationMessage();
        return true;
    }

    public setValidationMessage (message?: string) {
        if (message) {
            this.element.classList.add("invalid");
            this.message.innerText = message;
        } else {
            this.element.classList.remove("invalid");
            this.message.innerText = this.options.description ?? "";
        }
    }
}

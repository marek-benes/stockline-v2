import template from "./input.hbs";
import "./input.scss";

interface IInputOptions {
    label?: string;
    placeholder?: string;
    description?: string;
    type: "string" | "number";
    required?: boolean;
    validation?: (value: string | number) => boolean;
}

export class Input1 {
    public input: HTMLInputElement;
    private element: HTMLDivElement;
    private message: HTMLDivElement;

    constructor (public readonly id, private value?: string | number, private options?: IInputOptions) {}

    public show (target: HTMLElement) {
        target.insertAdjacentHTML("beforeend", template({
            id: this.id,
            value: this.value ?? "",
            label: this.options?.label ?? "",
            noLabel: !this.options?.label,
            description: this.options?.description ?? "",
            placeholder: this.options?.placeholder ?? "",
            required: this.options?.required
        }));

        this.input = target.querySelector(`#${this.id}`);
        this.element = this.input.parentNode as HTMLDivElement;
        this.message = this.element.querySelector("div.message");
    }

    public setValue (value: string | number) {
        if (typeof value === "number") {
            this.input.value = value.toString();
        } else {
            this.input.value = value;
        }
    }

    public getValue (): string | number {
        const value = this.input.value;
        if (this.options.type === "number") {
            return parseFloat(value);
        }
        return value;
    }

    public validate (): boolean {
        if (this.options.required && !this.input.value) {
            this.setValidationMessage("Toto pole je povinné");
            return false;
        }

        const value = this.getValue();

        if (this.options.type === "number" && isNaN(value as number)) {
            this.setValidationMessage("Hodnota musí být číslo");
            return false;
        }

        if (this.options.validation && !this.options.validation(value)) {
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

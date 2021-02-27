import { PaymentMethod } from "./PaymentMethod";

export interface ICustomer {
    id: string;
    name: string;
    regNo: string;
    vatNo: string;
    disabled: boolean;
    address: {
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    contacts: Array<{
        name: string;
        phone: string;
    }>;
    defaults: {
        duePeriod: number;
        paymentMethod: PaymentMethod;
    };
}

export interface ICustomerRequest {
    limit?: number;
    disabled?: boolean;
    name?: string;
    sort?: string;
}

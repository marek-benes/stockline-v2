import { ObjectId } from "mongodb";

export type PaymentMethod = "Cash" | "Card" | "CashOnDelivery" | "DirectDebit";

export interface Customer {
    id?: ObjectId;
    disabled?: boolean;
    name: string;
    regNo?: string;
    vatNo?: string;
    address?: {
        street: string;
        city: string;
        zip: string;
        country: string;
    },
    contacts: {
        name?: string;
        phone?: string;
        email?: string;
        note?: string;
    }[],
    defaults: {
        duePeriod?: number;
        paymentMethod?: PaymentMethod;
        pricelist_id?: ObjectId;
    }
    note?: string;
}
import { ObjectId } from "mongodb";

export interface Store {
    id?: ObjectId;
    disabled?: boolean;
    type: "Retail" | "Wholesale";
    name: string;
    shortcut: string;
    address?: {
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    warehouses?: { id: ObjectId, name: string }[];
    eet?: { premisesId: number, registerId: number };
}

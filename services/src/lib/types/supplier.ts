import { ObjectId } from "mongodb";

export interface Supplier {
    id?: ObjectId;
    disabled?: boolean;
    name: string;
}

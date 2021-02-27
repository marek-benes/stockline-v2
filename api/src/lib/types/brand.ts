import { ObjectId } from "mongodb";

export interface Brand {
    id?: ObjectId;
    disabled?: boolean;
    name: string;
}

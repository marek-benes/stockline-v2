import { ObjectId } from "mongodb";

export interface Category {
    id?: ObjectId;
    disabled?: boolean;
    name: string;
}

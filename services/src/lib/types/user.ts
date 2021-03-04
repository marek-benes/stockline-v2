import { ObjectId } from "mongodb";

export type Module = "Wholesale" | ObjectId;

export interface User {
    id?: ObjectId;
    disabled?: boolean;
    name: string;
    username: string;
    password: string;
    module: Module;
    auth?: { token: string, expiration: Date }
}

import { ObjectId } from "bson";

const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

export class JsonHelper {

    public static stringify(v: any): any {
        return JSON.stringify(v, null, 2);
    }

    public static parse(s: string): any {
        return !s ? {} : JSON.parse(s, JsonHelper.reviver);
    }

    public static reviver(key: string, value: any): any {
        if (typeof value == "string") {

            if (value.length == 24 && ObjectId.isValid(value)) {
                return new ObjectId(value);
            }

            if (ISO_8601_FULL.exec(value)) {
                return new Date(value);
            }

        }

        return value;
    }
}

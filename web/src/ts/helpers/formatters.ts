import moment from "moment";

moment.locale("cs");

export function asDate (timestamp?: string): string {
    return moment(timestamp).format("L");
}

export function asDateTime (timestamp?: string): string {
    return asDate(timestamp) + " " + moment(timestamp).format("LT");
}
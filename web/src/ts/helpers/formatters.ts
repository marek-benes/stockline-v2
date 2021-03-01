// import moment from "moment";

// moment.locale("cs");

export function asDate (timestamp?: string): string {
    // return moment(timestamp).format("L");
    return new Date(timestamp).toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });
}

export function asDateTime (timestamp?: string): string {
    // return asDate(timestamp) + " " + moment(timestamp).format("LT");
    return asDate(timestamp) + " " + new Date(timestamp).toLocaleTimeString("cs-CZ");
}
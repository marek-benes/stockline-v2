import moment from "moment";

interface IStoredObject<T> {
    timestamp: string;
    data: T;
}

export class Storage<T> {
    public get length () { return this.data.length; }

    private data: Array<IStoredObject<T>> = [];

    constructor (private key: string, private daysToExpire: number = 1) {
        this.restore();
    }

    public add (data: T) {
        this.data.push({
            timestamp: new Date().toISOString(),
            data
        });
        this.save();
    }

    public get (timestamp: string) {
        return this.data.filter((x) => x.timestamp === timestamp)[0];
    }

    public remove (timestamp: string) {
        this.data = this.data.filter((x) => x.timestamp !== timestamp);
        this.save();
    }

    public list (): Array<IStoredObject<T>> {
        return this.data;
    }

    private save () {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    private restore () {
        const stored = localStorage.getItem(this.key);
        try {
            this.data = JSON.parse(stored ?? "[]");

            const time = moment().subtract(this.daysToExpire, "days").toISOString();
            this.data.filter((x) => x.timestamp >= time);
        } catch (e) {
            this.data = [];
        }
    }
}

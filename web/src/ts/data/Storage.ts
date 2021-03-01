// import moment from "moment";

interface IStoredObject<T> {
    // timestamp: number;
    timestamp: number;
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
            // timestamp: new Date().toISOString(),
            timestamp: Date.now(),
            data
        });
        this.save();
    }

    public get (timestamp: number) {
        return this.data.filter((x) => x.timestamp === timestamp)[0];
    }

    public remove (timestamp: number) {
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

            // const time = moment().subtract(this.daysToExpire, "days").toISOString();
            const time = Date.now() - (this.daysToExpire * 24 * 60 * 60 * 1000);
            this.data.filter((x) => x.timestamp >= time);
        } catch (e) {
            this.data = [];
        }
    }
}

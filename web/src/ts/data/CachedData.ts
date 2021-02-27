export class CachedData <T = any> {
    private data: T;
    private expiration: number;

    constructor (private requestData: () => Promise<T>, private minutes: number = 5) {
        // requestData: how to load data, for example a http request
        // minutes: expiration of cache in minutes
    }

    public async getData (): Promise<T> {
        if (!this.data || !this.expiration || this.expiration <= Date.now()) {
            this.data = await this.requestData();
            this.expiration = Date.now() + (this.minutes * 60 * 1000);
        }

        return this.data;
    }

    public invalidate () {
        this.expiration = 0;
    }
}
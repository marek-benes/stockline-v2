import { API } from "ts/models/IApi";
import { IDataset } from "../../models/api/IDataset";
import { IReceipt, IReceiptRequest } from "../../models/api/IReceipt";
import { HttpClient } from "./HttpClient";

export class ReceiptsClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    constructor (private api: API, token: string) {
        this.httpClient = new HttpClient();

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getReceipts (options?: IReceiptRequest): Promise<IReceipt[]> {
        const receipts = await this.httpClient.get<IDataset<IReceipt[]>>(this.api.data + `/datasets/receipts${this.httpClient.createQueryString(options)}`, this.httpHeaders);
        return receipts.data;
    }

    public async getReceipt (id: string): Promise<IReceipt> {
        const receipts = await this.httpClient.get<IDataset<IReceipt[]>>(this.api.data + `/datasets/receipts?id=${id}`, this.httpHeaders);
        return receipts?.data[0];
    }

    // TODO: postReceipt
}

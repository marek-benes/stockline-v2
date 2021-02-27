import { IDataset } from "../../models/api/IDataset";
import { IReceipt, IReceiptRequest } from "../../models/api/IReceipt";
import { HttpClient } from "./HttpClient";

export class ReceiptsClient {
    private httpClient: HttpClient;
    private httpHeaders: { [key: string]: number | string };

    constructor (private baseUrl: string, token: string) {
        this.httpClient = new HttpClient(this.baseUrl);

        this.httpHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${token}`
        };
    }

    public async getReceipts (options?: IReceiptRequest): Promise<IReceipt[]> {
        const receipts = await this.httpClient.get<IDataset<IReceipt[]>>(`/receipts${this.httpClient.createQueryString(options)}`, this.httpHeaders);
        return receipts.data;
    }

    public async getReceipt (id: string): Promise<IReceipt> {
        const receipt = await this.httpClient.get<IReceipt>(`/receipts/${id}`, this.httpHeaders);
        return receipt;
    }

    // TODO: postReceipt
}

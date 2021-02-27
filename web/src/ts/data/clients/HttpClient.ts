import { HttpError } from "./HttpError";

interface IHttpHeaders {
    [key: string]: string | number;
}

export class HttpClient {
    constructor (private baseUrl: string) { }

    public async get<T> (route: string, headers: IHttpHeaders): Promise<T> {
        console.log("GET", this.baseUrl + route);
        const response = await fetch(this.baseUrl + route, {
            headers: this.getHeaders(headers)
        });

        return this.createResponse<T>(response);
    }

    public async post<T = void> (route: string, payload: any, headers: IHttpHeaders): Promise<T> {
        console.log("POST", this.baseUrl + route, payload);
        const response = await fetch(this.baseUrl + route, {
            method: "POST",
            body: payload !== undefined ? JSON.stringify(payload) : undefined,
            headers: this.getHeaders(headers)
        });

        return this.createResponse<T>(response);
    }

    public async put<T = void> (route: string, payload: any, headers: IHttpHeaders): Promise<T> {
        console.log("PUT", this.baseUrl + route, payload);
        const response = await fetch(this.baseUrl + route, {
            method: "PUT",
            body: payload !== undefined ? JSON.stringify(payload) : undefined,
            headers: this.getHeaders(headers)
        });

        return this.createResponse<T>(response);
    }

    public async delete<T = void> (route: string, payload: any, headers: IHttpHeaders): Promise<T> {
        console.log("DELETE", this.baseUrl + route, payload);
        const response = await fetch(this.baseUrl + route, {
            method: "DELETE",
            body: payload !== undefined ? JSON.stringify(payload) : undefined,
            headers: this.getHeaders(headers)
        });

        return this.createResponse<T>(response);
    }

    public createQueryString (options?: object): string {
        if (!options) { return ""; }

        let result = "?";

        result += Object.keys(options).map((key) => {
            const value = options[key];

            if (Array.isArray(value)) {
                return `${key}=${value.join(",")}`;
            } else if (typeof key === "object") {
                return `${key}=${JSON.stringify(value)}`;
            } else if (value === undefined) {
                return undefined;
            }

            return `${key}=${value}`;
        }).filter((x) => x !== undefined).join("&");

        return result;
    }

    private getHeaders (headers: IHttpHeaders): Headers {
        const requestHeaders = new Headers();

        for (const i in headers) {
            if (!headers[i]) { continue; }
            requestHeaders.append(i, headers[i].toString());
        }

        return requestHeaders;
    }

    private async createResponse<T> (response: Response): Promise<T> {
        console.log(response.status, response.statusText, response.url);
        switch (response.status) {
            case 204: return undefined;
            case 400:
                let data: any;
                try {
                    data = await response.json();
                } catch (err) {
                    data = undefined;
                }
                throw new HttpError(400, data?.message ?? response.statusText);
            case 401:
            case 403:
                if (response.url.indexOf("/auth") === -1) {
                    location.reload();
                }
                return undefined;
            case 404: throw new HttpError(404, response.statusText);
            case 500: throw new HttpError(500, response.statusText);
            default:
                try {
                    const json = await response.json();
                    return json;
                } catch (err) {
                    return undefined;
                }
        }
    }
}

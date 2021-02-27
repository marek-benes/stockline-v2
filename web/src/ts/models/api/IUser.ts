type Module = "Wholesale" | string;

export interface IUser {
    token: string;

    id: string;
    name: string;
    username: string;
    password: string;
    module: Module;
}

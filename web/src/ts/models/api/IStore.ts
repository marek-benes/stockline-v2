export interface IStore {
    id: string;
    name: string;
    shortcut: string;
    type: string;
    address: {
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    eet?: {
        premisesId: number,
        registerId: number
    };
    warehouses?: Array<{
        id: string;
        name: string;
    }>;
}

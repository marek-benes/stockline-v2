// 200 Ok - pro všechny operace, které proběhnou v pořádku (GET, POST, PUT, DELETE)
// 204 No Content - v případě požadavku na neexistující dokument
// 400 Bad Request - v případě nevalidního JSON v requestu (POST, PUT); součástí odpovědi je i textový popis chyby, který lze zobrazit uživateli.
// 404 Not Found - v případě požadavku na neexistující API
// 500 Internal Serever Error - v případě běhové chyby API serveru

export class HttpError extends Error {
    constructor (public status: number, message?: string) {
        super(message);
    }
}

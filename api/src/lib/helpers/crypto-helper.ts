import * as crypto from "crypto";

export class CryptoHelper {

    private static readonly iterations: number = 10000;
    private static readonly keylen: number = 64;
    private static readonly encoding: BufferEncoding = "base64";

    // Ref: https://www.geeksforgeeks.org/node-js-password-hashing-crypto-module/
    public static hashPassword(password: string): string {
        // Creating a unique salt for a particular user
        let salt: string = crypto.randomBytes(16).toString("base64");

        // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keylen, `sha512`).toString(CryptoHelper.encoding);

        // Add salt to hash
        return salt + ":" + hash;
    }

    public static verifyPassword(password: string, hashedPassword: string): boolean {
        let splits = hashedPassword.split(":");
        let x = splits[1];

        let hash = crypto.pbkdf2Sync(password, splits[0], this.iterations, this.keylen, `sha512`).toString(CryptoHelper.encoding);

        return hash == x;
    }

    public static generateToken(): string {
        return crypto.randomBytes(16).toString("hex");
    }
}

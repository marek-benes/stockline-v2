import { ApiUser } from "../../lib/rest/types";
import { User } from "../../lib/types/user";
import { CryptoHelper } from "../../lib/helpers/crypto-helper";
import moment from "moment";
import { ObjectId } from "bson";

const TOKEN_LIFETIME = 20;  // Token lifetime in minutes

export module UserStore {

    let authUsers: { [key: string]: { expiration: Date; user: ApiUser } } = {};

    export function addAuthUser(user: User): string {
        let token = CryptoHelper.generateToken();

        authUsers[token] = {
            expiration: moment().add(TOKEN_LIFETIME, "minutes").toDate(),
            user: {
                id: user.id,
                name: user.name,
                module: user.module,
                token: token
            }
        };

        return token;
    }

    export function getAuthUser(token: string, renewToken: boolean): ApiUser | null {
        let authUser = authUsers[token];

        if (!authUser) {
            return null;
        }

        if (renewToken) {
            authUser.expiration = moment().add(TOKEN_LIFETIME, "minutes").toDate();
        }

        return authUser.user;
    }

    export function deleteToken(token: string): void {
        delete authUsers[token];
    }

    export function deleteAuthUser(id: ObjectId): void {
        for (let key of Object.keys(authUsers)) {
            if (authUsers[key].user.id == id) {
                delete authUsers[key];
            }
        }
    }
}

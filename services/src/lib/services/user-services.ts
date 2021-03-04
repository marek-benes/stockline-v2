import { Mongo } from "../mongo/mongo";
import { ObjectId } from "mongodb";
import { DbCollection } from "../mongo/types";
import { CryptoHelper } from "../helpers/crypto-helper";
import { User } from "../types/user";
import moment from "moment";

const USER_TOKEN_LIFETIME = 48;  // Token lifetime in hours

export class UserServices {

    private readonly mongo: Mongo;

    constructor(mongo: Mongo) {
        this.mongo = mongo;
    }

    public async findByAuthToken(token: string): Promise<User | null> {
        // Find user by token
        let user = await this.mongo.findOne<User>(DbCollection.Users, { "auth.token": token });

        // Return user with valid token
        return user?.auth?.expiration > new Date() ? user : undefined;
    }

    public async insert(user: User): Promise<User | null> {
        // Insert a new user and return it
        let insertedId = await this.mongo.insertOne<User>(DbCollection.Users, user);
        return await this.mongo.findOne<User>(DbCollection.Users, insertedId);
    }

    public async update(user: User): Promise<User | null> {
        // Safe update user properties and return it
        await this.mongo.updateOne(DbCollection.Users, user.id, {
            $set: {
                disabled: user.disabled,
                id: user.id,
                name: user.name,
                module: user.module,
                token: undefined
            }
        });

        return await this.mongo.findOne<User>(DbCollection.Users, user.id);
    }

    public async delete(id: ObjectId): Promise<void> {
        // Delete from database
        await this.mongo.deleteOne(DbCollection.Users, id);
    }

    public async addAuthToken(userId: ObjectId): Promise<string> {
        // Create a new token
        const token = CryptoHelper.generateToken();

        // Add token expiration
        const expiration = moment().add(USER_TOKEN_LIFETIME, "minutes").toDate();

        // Safe update user properties
        await this.mongo.updateOne<User>(DbCollection.Users, userId, {
            $set: {
                auth: {
                    token: token,
                    expiration: expiration
                }
            }
        });

        // Return a new token
        return token;
    }

    public async renewAuthToken(token: string): Promise<void> {
        // Shift token expiration
        const expiration = moment().add(USER_TOKEN_LIFETIME, "minutes").toDate();

        await this.mongo.updateOne<User>(DbCollection.Users, { "auth.token": token }, {
            $set: {
                auth: {
                    token: token,
                    expiration: expiration
                }
            }
        });
    }

    public async deleteAuthToken(token: string): Promise<void> {
        // Find user by token
        let user = await this.mongo.findOne<User>(DbCollection.Users, { "auth.token": token });
        if (!user) {
            return;
        }

        // We must construct query dynamically
        let query: any = { "$unset": {} };

        query.$unset["auth"] = "";

        await this.mongo.updateOne<User>(DbCollection.Users, user.id, query);
    }

}
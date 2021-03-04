import { Request, RequestHandler } from "restify";
import { ObjectId } from "mongodb";
import { MicroserviceOptions } from "../microservice/types";
import { Module } from "../types/user";

export interface ApiServerOptions extends MicroserviceOptions {
    port: number;
}

export interface ApiRoute {
    method: "GET" | "POST" | "PUT" | "DELETE"
    route: string,
    handler: RequestHandler
}

export interface ApiRequest extends Request {
    user: ApiUser;
}

export interface ApiUser {
    id: ObjectId;
    name: string;
    module: Module;
    token: string;
}

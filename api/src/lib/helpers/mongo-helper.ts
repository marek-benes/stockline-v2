import { FindOneOptions } from "mongodb";


export class MongoHelper {

    public static isDuplicatedKeyError(e: any) {
        return (e.name === "MongoError" && e.code === 11000);
    }

    public static buildFindOptions(query: any): FindOneOptions<any> | undefined {
        if (!query) {
            return;
        }

        let options: FindOneOptions<any> = {};

        // Add sort
        if (query.sort) {
            let sort: any[] = [];

            query.sort.split(",").forEach(x => {
                const expression = x.split(":");
                const field = expression[0];
                const desc: number = expression.length == 2 && expression[1] == "desc" ? -1 : 1;

                sort.push([field, desc]);
            });

            options.sort = sort;
        }

        // Set paging
        if (query.pagesize) {
            const pageSize: number = Number(query.pagesize);
            const page: number = Number(query.page || 1);

            options.skip = (page - 1) * pageSize;
            options.limit = pageSize;
        }

        return options;
    }

}
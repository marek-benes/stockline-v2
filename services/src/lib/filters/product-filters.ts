import { FilterQuery, ObjectId } from "mongodb";

export class ProductFilters {

    public static buildProductFilterQuery(queryString: any): FilterQuery<any> {
        let filter = { $and: [] };

        // Build FilterQuery
        if (queryString["id"]) {
            filter.$and.push({ "_id": new ObjectId(queryString["id"]) });
        }

        if (queryString["code"]) {
            filter.$and.push({ "code": queryString["code"] });
        }

        if (queryString["name"]) {
            filter.$and.push({ $text: { $search: queryString["name"] } });
        }

        if (queryString["brand_id"]) {
            filter.$and.push({ "brand_id": new ObjectId(queryString["brand_id"]) });
        }

        if (queryString["category_id"]) {
            filter.$and.push({ "category_id": new ObjectId(queryString["category_id"]) });
        }

        if (queryString["supplier_id"]) {
            filter.$and.push({ "supplier_id": new ObjectId(queryString["supplier_id"]) });
        }

        if (!queryString.hasOwnProperty("disabled")) {
            filter.$and.push({ disabled: { $ne: true } });
        }

        // Clean up
        if (filter.$and.length == 0) {
            delete filter.$and;
        }

        return filter;

    }
}
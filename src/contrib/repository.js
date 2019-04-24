import {getRequestUrl} from "../utils/helpers";
import responseCodes, {sendResponse} from "./response.py";


export class BaseRepository {

    constructor(Model) {
        this.DEFAULT_LIMIT = 50;
        this.DEFAULT_OFFSET = 0;
        this.Model = Model;
    }

    prevPageUrl(req, limit, offset) {
        let prevUrl = null;
        if (offset - limit >= 0) {
            let prevOffset = offset - limit;
            let url = new URL(getRequestUrl(req));
            url.searchParams.set('offset', prevOffset);
            url.searchParams.set('limit', limit);
            prevUrl = url.toString();
        }
        return prevUrl;
    }

    nextPageUrl(req, limit, offset, total_count) {
        let nextUrl = null;
        if (total_count > offset + limit) {
            let nextOffset = offset + limit;
            let url = new URL(getRequestUrl(req));
            url.searchParams.set('offset', nextOffset);
            url.searchParams.set('limit', limit);
            nextUrl = url.toString();
        }
        return nextUrl;
    }

    async getPaginatedResponse(req, sortQuery, query) {
        let queryParams = req.query;
        let limit = queryParams.limit == undefined || isNaN(queryParams.limit) ?
            this.DEFAULT_LIMIT : parseInt(queryParams.limit);
        let offset = queryParams.offset == undefined && isNaN(queryParams.offset) ?
            this.DEFAULT_OFFSET : parseInt(queryParams.offset);
        let total_count = await this.Model.find(query).countDocuments();
        return {
            count: total_count,
            prev: this.prevPageUrl(req, limit, offset),
            next: this.nextPageUrl(req, limit, offset, total_count),
            results: await this.Model.find(query).sort(sortQuery).skip(offset).limit(limit)
        };
    }

    getSortedQuery(req) {
        return req.query.ordering == undefined ? '' : req.query.ordering.trim();
    }

    async get_object_or_404(res, id) {
        let instance = await this.Model.findOne({_id: id});
        if (instance != null) {
            return instance;
        } else {
            sendResponse(res, responseCodes.HTTP_404_NOT_FOUND);
        }
    }

    async getList(req) {
        let query = {};
        let sortQuery = this.getSortedQuery(req);
        return await this.getPaginatedResponse(req, sortQuery, query);
    }

    async create(data) {
        return await this.Model.create(data);
    }

    async update(instance, data) {
        for (let field in data) {
            instance[field] = data[field];
        }
        return await instance.save()
    }


    async delete_object_or_404(res, id) {
        let data = await this.Model.deleteOne({_id: id});
        if (data.deletedCount != 0) {
            return true;
        } else {
            sendResponse(res, responseCodes.HTTP_404_NOT_FOUND);
        }
    }
}
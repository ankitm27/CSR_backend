import responseCodes, {sendResponse} from "./response.py";

export class BaseController {
    constructor(Repository) {
        this.repository = new Repository();
    }

    getListQuery(req) {
        return {};
    }

    getDetailQuery(req) {
        return {};
    }

    getUpdateQuery(req) {
        return {}
    }

    getDeleteQuery(req) {
        return {}
    }

    performCreate(req) {
        return req.body;
    }

    performUpdate(req) {
        return req.body;
    }

    getDetailResponse(instance) {
        return instance;
    }

    async getList(req, res, next) {
        let query = await this.getListQuery(req);
        let response = await this.repository.getList(req);
        sendResponse(res, responseCodes.HTTP_200_OK, null, response);
    }

    async getDetail(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getDetailQuery(req);
        let response = await this.repository.get_object_or_404(res, uid);
        if (response) {
            sendResponse(res, responseCodes.HTTP_200_OK, null, await this.getDetailResponse(response));
        }
    }

    async create(req, res, next) {
        try{
            let data = await this.performCreate(req);
            let response = await this.repository.create(data);
            sendResponse(res, responseCodes.HTTP_201_CREATED, null, response)
        }catch (e) {
            console.log(e);
        }
    }

    async update(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getUpdateQuery(req);
        let data = await this.performUpdate(req);
        let instance = await this.repository.get_object_or_404(res, uid);
        if (instance) {
            let response = await this.repository.update(instance, data);
            sendResponse(res, responseCodes.HTTP_200_OK, null, response);
        }
    }

    async delete(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getDeleteQuery(req);
        let response = await this.repository.delete_object_or_404(res, uid);
        if (response) {
            sendResponse(res, responseCodes.HTTP_204_NO_CONTENT)
        }
    }
}
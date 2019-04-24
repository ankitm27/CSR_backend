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

    async getList(req, res, next) {
        let query = await this.getListQuery(req);
        res.send(await this.repository.getList(req));
    }

    async getDetail(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getDetailQuery(req);
        res.send(await this.repository.get_object_or_404(res, uid));
    }

    async create(req, res, next) {
        try {
            let data = await this.performCreate(req);
            res.send(await this.repository.create(data));
        } catch (e) {
            console.log(e);
        }
    }

    async update(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getUpdateQuery(req);
        let data = await this.performUpdate(req);
        let instance = await this.repository.get_object_or_404(res, uid);
        res.send(await this.repository.update(instance, data));
    }

    async delete(req, res, next) {
        let uid = req.params.uid;
        let query = await this.getDeleteQuery(req);
        await this.repository.delete_object_or_404(res, uid);
        res.send(204);
    }
}
import {Program} from "../users/model";

export class BaseRepository {

    constructor(Model) {
        this.Model = Model;
    }

    async get_object_or_404(res, id) {
        let instance = await this.Model.findOne({_id: id});
        if (instance != null){
            return instance;
        }else{
            res.sendStatus(404).json({});
        }
    }

    async delete_object_or_404(res, id) {
        let data = await this.Model.deleteOne({_id: uid});
        if (data.deletedCount != 0) {
            return true;
        }else{
            res.sendStatus(404).json({});
        }

    }
}
import {BaseRepository} from "../contrib/repository";
import {Form, Program} from "./model";

// import {currency_mapping} from "./constants";


export class UserRepository {

    constructor() {
    }

    async getUser() {

    }

    async createUser(data) {
        return await "Hello";
        // return await User.find();
        // data.password = makeHash(data.password);
        // console.log(data);
        // User.create(data, (err, instance) => {
        //     if (err){
        //         return err;
        //     }
        //     return instance;
        // });
    }

}


export class ProgramRepository extends BaseRepository {
    constructor() {
        super(Program);
    }
}


export class FormRepository extends BaseRepository {
    constructor() {
        super(Form);
    }
}
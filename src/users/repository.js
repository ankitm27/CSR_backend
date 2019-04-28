import {BaseRepository} from "../contrib/repository";
import {Beneficiary, Form, Program, User} from "./model";


export class UserRepository extends BaseRepository {

    constructor() {
        super(User);
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

export class BeneficiaryRepository extends BaseRepository {
    constructor() {
        super(Beneficiary);
    }
}
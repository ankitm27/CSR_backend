
import {UserModel} from "./model";
// import {currency_mapping} from "./constants";
import {makeHash} from "../utils/helpers";


export class UserRepository {

    constructor() {
    }

    async createUser(data) {
        return await "Hello";
        // return await UserModel.find();
        // data.password = makeHash(data.password);
        // console.log(data);
        // UserModel.create(data, (err, instance) => {
        //     if (err){
        //         return err;
        //     }
        //     return instance;
        // });
    }

}

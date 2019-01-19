import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {UserRepository} from "./repository";
import {makeHash, compareHash} from "../utils/helpers";
import util from "util";
import {UserModel} from "./model";


export class UserController {
    constructor() {
        this.userRepository = new UserRepository();
        // this.converterService = new UserService();
    }

    async login(req, res, next) {
        let data = req.body;
        let user = await UserModel.findOne({"email": data.email});
        if(user == null) {
            res.send({
                "status_code": 400,
                "error": "Email not found"
            })
        }else {
            if (compareHash(data.password, user.password) == false) {
                res.send({
                    "status_code": 400,
                    "error": "Invalid password"
                })
            }else {
                let token = await jwt.sign({"email": user.email}, jwtSecret, { expiresIn: '24h'});
                res.send({
                    "status_code": 200,
                    "token": token
                });
            }
        }
        res.send();
    }

    async register(req, res, next) {
        // console.log(await this.userRepository.createUser(req.body));
        let data = req.body;
        data.password = makeHash(data.password);
        if(await UserModel.findOne({'email': data.email}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this email"
            })
        }else if(await UserModel.findOne({'mobile': data.mobile}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this mobile"
            })
        }else {
            let user = UserModel(data);
            await user.save();
            res.send(await user);
        }
    }
}

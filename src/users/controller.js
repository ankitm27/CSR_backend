import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {FormRepository, ProgramRepository, UserRepository} from "./repository";
import {compareHash, makeHash} from "../utils/helpers";
import {User} from "./model";
import {BaseController} from "../contrib/controller";


export class UserController {
    constructor() {
        this.userRepository = new UserRepository();
        // this.converterService = new UserService();
    }

    async login(req, res, next) {
        let data = req.body;
        let user = await User.findOne({"email": data.email});
        if (user == null) {
            res.send({
                "status_code": 400,
                "error": "Email not found"
            });
        } else {
            if (compareHash(data.password, user.password) == false) {
                res.send({
                    "status_code": 400,
                    "error": "Invalid password"
                })
            } else {
                let token = await jwt.sign({"email": user.email}, jwtSecret, {expiresIn: '24h'});
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
        if (await User.findOne({'email': data.email}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this email"
            })
        } else if (await User.findOne({'mobile': data.mobile}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this mobile"
            })
        } else {
            let user = await User.create(data);
            res.send(user);
        }
    }
}


export class ProgramController extends BaseController {
    constructor() {
        super(ProgramRepository);
    }

    performCreate(req) {
        let data = req.body;
        data.user = req.user._id;
        return data;
    }
}


export class FormController extends BaseController {
    constructor() {
        super(FormRepository);
    }

    performCreate(req) {
        let data = req.body;
        data.user = req.user._id;
        return data;
    }
}

import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {FormRepository, ProgramRepository, UserRepository} from "./repository";
import {compareHash, makeHash} from "../utils/helpers";
import {User} from "./model";
import {BaseController} from "../contrib/controller";
import responseCodes, {sendResponse} from "../contrib/response.py";


export class UserController {
    constructor() {
        this.userRepository = new UserRepository();
        // this.converterService = new UserService();
    }

    async login(req, res, next) {
        let data = req.body;
        let user = await User.findOne({"email": data.email});
        if (user == null) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Email not found");
        } else {
            if (compareHash(data.password, user.password) == false) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid password");
            } else {
                let token = await jwt.sign({"email": user.email}, jwtSecret, {expiresIn: '24h'});
                sendResponse(res, responseCodes.HTTP_200_OK, null, {token: token});
            }
        }
    }

    async register(req, res, next) {
        let data = req.body;
        data.password = makeHash(data.password);
        if (await User.findOne({'email': data.email}) != null) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this email");
        } else if (await User.findOne({'mobile': data.mobile}) != null) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this mobile");
        } else {
            let user = await User.create(data);
            sendResponse(res, responseCodes.HTTP_200_OK, null, user);
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

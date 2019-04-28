import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {BeneficiaryRepository, FormRepository, ProgramRepository, UserRepository} from "./repository";
import {compareHash, makeHash} from "../utils/helpers";
import {User} from "./model";
import {BaseController} from "../contrib/controller";
import responseCodes, {sendResponse} from "../contrib/response.py";
import ROLE_CHOICES from "./model";


export class UserController extends BaseController{
    constructor() {
        super(UserRepository);
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

    async volunteerLogin(req, res, next) {
        let data = req.body;
        let user = await User.findOne({"mobile": data.mobile, role: ROLE_CHOICES.VOLUNTEER});
        if (user == null) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Mobile not found");
        } else {
            if (compareHash(data.password, user.password) == false) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid password");
            } else {
                let token = await jwt.sign({"email": user.email}, jwtSecret, {expiresIn: '24h'});
                sendResponse(res, responseCodes.HTTP_200_OK, null, {token: token,  resetPassword: user.allowLoggedIn});
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
            data.role = ROLE_CHOICES.VOLUNTEER;
            let user = await User.create(data);
            sendResponse(res, responseCodes.HTTP_200_OK, null, user);
        }
    }

    async resetPassword(req, res, next) {
        let data = req.body;
        let user = req.user;
        if (compareHash(data.currentPassword, user.password) == false) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid current password");
        }else if (data.newPassword != data.confirmPassword) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Both password did not match");
        } else {
            user.password = makeHash(data.newPassword);
            user.allowLoggedIn = true;
            user.save();
            sendResponse(res, responseCodes.HTTP_200_OK, null, {updated: true});
        }
    }

    async getCurrentUserDetail(req, res, next) {
        try {
            sendResponse(res, responseCodes.HTTP_200_OK, null, req.user);
        }catch (e) {
            console.log(e);
        }
    }

    async updateCurrentUserDetail(req, res, next) {
        try {
            let data = req.body;
            delete data["mobile"];
            delete data["email"];
            delete data["password"];
            delete data["role"];
            let user = this.repository.update(req.user, data);
            sendResponse(res, responseCodes.HTTP_200_OK, null, req.user);
        }catch (e) {
            console.log(e);
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


export class BeneficiaryController extends BaseController {
    constructor() {
        super(BeneficiaryRepository);
    }
}


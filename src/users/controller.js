import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {
    BeneficiaryRepository,
    FormQuestionRepository,
    FormRepository,
    ProgramRepository, QuestionRepository,
    UserRepository
} from "./repository";
import {compareHash, makeHash, getValidationObjects, validateAnswer} from "../utils/helpers";
import {Question, User, Validation} from "./model";
import {BaseController} from "../contrib/controller";
import responseCodes, {sendResponse} from "../contrib/response.py";
import {ROLE_CHOICES} from "./model";


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
        let role = req.params.role;
        if(Object.values(ROLE_CHOICES).includes(role)) {
            data.password = makeHash(data.password);
            if (await User.findOne({'email': data.email}) != null) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this email");
            } else if (await User.findOne({'mobile': data.mobile}) != null) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this mobile");
            } else {
                data.role = role;
                data.allowLoggedIn = role == ROLE_CHOICES.ADMIN
                let user = await User.create(data);
                sendResponse(res, responseCodes.HTTP_200_OK, null, {});
            }
        }else{
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid role provided");
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

    async getQuestion(req, res, next) {
        try {
            let program = await this.repository.get_object_or_404(res, req.params.uid);
            let questions = await program.questions.toObject();
            let response = await questions.map(async(question) => {
                question.validations = await Validation.find({_id: {$in: question.validations }});
                return await question;
            });
            sendResponse(res, responseCodes.HTTP_200_OK, null, await Promise.all(response));
        }catch (e) {
            console.log(e);
        }
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

    performCreate(req) {
        let data = req.body;
        data.user = [req.user._id];
        return data;
    }
}

export class QuestionController extends BaseController {
    constructor() {
        super(QuestionRepository);
    }

    async getQuestion(req, res, next) {
        let questions = await Question.find({});
        sendResponse(res, responseCodes.HTTP_200_OK, null, questions);
    }
}

export class FormQuestionController {
    constructor() {
    }

    async addQuestion(req, res, next) {
        let data = req.body;
        let questionRespository = new QuestionRepository();
        let question = await questionRespository.get_object_or_404(res, data.question);
        let [errors, validations] = await getValidationObjects(data.program, question, data);
        if (errors.length != 0) {
            sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, errors);
        }else {
            let formQuestionRepository = new FormQuestionRepository();
            let formQuestion = await formQuestionRepository.createFormQuestion(data, validations);
            if(formQuestion.n == 1) {
                sendResponse(res, responseCodes.HTTP_200_OK, null, {"created": true});
            }else {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Error while creation");
            }
        }
    }

    async addAnswer(req, res, next) {
        let data = req.body;
        let questionRepository = new QuestionRepository();
        let errors = [];
        data.forEach(async(datum) => {
            let question = await questionRepository.get_object_or_404(res, datum.question);
            let [success, error] = await validateAnswer(question, datum);
            if (!success) {
                errors.push({
                    "question": datum.question,
                    "program": datum.program,
                    "error": error
                })
            }
        });
        if (errors.length == 0) {
            let formQuestionRepository = new FormQuestionRepository();
            let answer = await formQuestionRepository.createAnswer(data);
            sendResponse(res, responseCodes.HTTP_200_OK, null, answer)
        }else{
            sendResponse(res, responseCodes.HTTP_200_OK, errors)
        }
    }
}

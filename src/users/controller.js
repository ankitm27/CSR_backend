import jwt from 'jsonwebtoken';
import multer from 'multer';
import {jwtSecret, mediaPath, apiBaseUrl, jwtSecretExpirationInSeconds} from "../settings/config";
import {
    BeneficiaryRepository,
    FormQuestionRepository,
    FormRepository,
    ProgramRepository, QuestionRepository,
    UserRepository
} from "./repository";
import {
    compareHash,
    makeHash,
    getValidationObjects,
    validateAnswer,
    getValidators,
    isEmpty,
    randomIntFromRange
} from "../utils/helpers";
import {Answer, Beneficiary, Program, Question, User, Validation} from "./model";
import {BaseController} from "../contrib/controller";
import responseCodes, {sendResponse} from "../contrib/response.py";
import {ROLE_CHOICES} from "./model";


export class UserController extends BaseController{
    constructor() {
        super(UserRepository);
    }

    async login(req, res, next) {
        try {
            let data = req.body;
            let user = await User.findOne({"email": data.email});
            if (user == null) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Email not found");
            } else {
                if (compareHash(data.password, user.password) == false) {
                    sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid password");
                } else {
                    let token = await jwt.sign({"email": user.email}, jwtSecret,
                        {expiresIn: jwtSecretExpirationInSeconds});
                    let data = {
                        token: token,
                        user_id: user._id,
                        userName: user.firstName + " " + user.lastName,
                    };
                    sendResponse(res, responseCodes.HTTP_200_OK, null, data);
                }
            }
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
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
                let token = await jwt.sign({"email": user.email}, jwtSecret, {expiresIn: jwtSecretExpirationInSeconds});
                let data = {
                    token: token,
                    user_id: user._id,
                    userName: user.firstName + " " + user.lastName,
                    resetPassword: user.allowLoggedIn
                };
                sendResponse(res, responseCodes.HTTP_200_OK, null, data);
            }
        }
    }

    async register(req, res, next) {
        try {
            let data = req.body;
            let role = req.params.role;
            if(Object.values(ROLE_CHOICES).includes(role)) {
                if (data.password != data.confirmPassword) {
                    sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Both password did not match");
                }
                data.password = makeHash(data.password);
                if (await User.findOne({'email': data.email}) != null) {
                    sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this email");
                } else if (await User.findOne({'mobile': data.mobile}) != null) {
                    sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "User already exists with this mobile");
                } else {
                    data.role = role;
                    data.allowLoggedIn = role == ROLE_CHOICES.ADMIN;
                    try {
                        await User.create(data);
                    }catch (e) {
                        sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
                    }
                    sendResponse(res, responseCodes.HTTP_200_OK, null, {});
                }
            }else{
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid role provided");
            }
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            let data = req.body;
            let user = req.user;
            if (compareHash(data.currentPassword, user.password) == false) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Invalid current password");
            }else if (data.newPassword != data.confirmPassword) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Both password did not match");
            } else {
                user.password = makeHash(data.newPassword);
                user.allowLoggedIn = true;
                try {
                    user.save();
                }catch(e) {
                    sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
                }
                sendResponse(res, responseCodes.HTTP_200_OK, null, {updated: true});
            }
        }catch(e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async getCurrentUserDetail(req, res, next) {
        try {
            sendResponse(res, responseCodes.HTTP_200_OK, null, req.user);
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async updateCurrentUserDetail(req, res, next) {
        try {
            let data = req.body;
            delete data["mobile"];
            delete data["email"];
            delete data["password"];
            delete data["role"];
            try {
                req.user = this.repository.update(req.user, data);
            }catch(e){
                sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
            }
            sendResponse(res, responseCodes.HTTP_200_OK, null, req.user);
        }catch (e) {
            console.log(e);
        }
    }

    async getDashoardDetails(req, res, next) {
        try{
            let aggregateData = (await Program.aggregate(
                [
                    {
                        $match: {
                            user: req.user._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            overallGood: {$avg: "$good"},
                            overallBad: {$avg: "$bad"},
                            overallAverage: {$avg: "$average"},
                            goalAchievedAvg: {$avg: "$goalAchieved"},
                            totalFunding: {$sum: "$funding"}
                        }
                    }
                ]
            ))[0];
            let totalProgram = await Program.find({user: req.user._id}).countDocuments();
            let overallStatus = null;
            if(aggregateData != undefined) {
                if(aggregateData.overallGood >= 70) {
                    overallStatus = "good";
                }else if(aggregateData.overallGood >= 50) {
                    overallStatus = "average";
                }else {
                    overallStatus = "bad";
                }
            }
            let data = {
                "totalProgram": totalProgram,
                "totalFunding": aggregateData != undefined ? aggregateData.totalFunding : 0,
                "overallGood": aggregateData != undefined ? aggregateData.overallGood : 0,
                "overallBad": aggregateData != undefined ? aggregateData.overallBad : 0,
                "overallAverage": aggregateData != undefined ? aggregateData.overallAverage : 0,
                "overallStatus": overallStatus || 0,
                "goalAchievedAvg": aggregateData != undefined ? aggregateData.goalAchievedAvg : 0,
                "programs": await Program.find({user: req.user._id}, {questions: 0})
            };
            sendResponse(res, responseCodes.HTTP_200_OK, null, data);
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }
}


export class ProgramController extends BaseController {
    constructor() {
        super(ProgramRepository);
    }

    performCreate(req) {
        try {
            let data = req.body;
            data.user = req.user._id;
            data.average = randomIntFromRange(0, 100);
            data.good = randomIntFromRange(0, 100 - data.average);
            data.bad = 100 - data.average - data.good;
            return data;
        }catch (e) {
            console.log(e);
        }
    }

    async getQuestions(req, res, next) {
        try {
            let program = await this.repository.get_object_or_404(res, req.params.uid);
            let programQuestions = await program.questions.toObject();
            let questionRespository = new QuestionRepository();
            let response = await programQuestions.map(async (programQuestion) => {
                let question = await questionRespository.get_object_or_404(res, programQuestion.question);
                programQuestion.validators = await getValidators(question, programQuestion.validations);
                programQuestion.questionType = await question.questionType;
                programQuestion.isActive = await question.isActive;
                return await programQuestion;
            });
            sendResponse(res, responseCodes.HTTP_200_OK, null, await Promise.all(response));
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async getBenefeciaries(req, res, next) {
        try {
            let data = await {
                "totalBenefeciaries": this.repository.getBenefeciaries(req.params.uid)
            };
            sendResponse(res, responseCodes.HTTP_200_OK, null, data);
        } catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async getDetailResponse(instance) {
        try {
            instance = instance.toObject();
            instance.fundingPerBeneficiary = instance.funding / instance.targetBeneficiary;
            instance.totalAreaCovered = randomIntFromRange(0, 1000);
            instance.usersGood = randomIntFromRange(0, 100);
            instance.usersRevised = randomIntFromRange(0, 100);
            instance.usersFraud = randomIntFromRange(0, 100);
            instance.rulesGood = randomIntFromRange(0, 100);
            instance.rulesRevised = randomIntFromRange(0, 100);
            instance.rulesFraud = randomIntFromRange(0, 100);

            let beneficiaries = await Beneficiary.find({users: {$in: instance.user}});
            let beneficiariesData = [];
            let RISK_CHOICES = ['high', 'medium', 'low'];
            let STATUS_CHOICES = ['verified', 'unverified', 'duplicate', 'fraud'];
            try {
                for (let beneficiary of beneficiaries) {
                    beneficiary = beneficiary.toObject();
                    beneficiary.date = beneficiary.createdAt;
                    beneficiary.totalDetail = await Answer.find({beneficiary: beneficiary._id}).countDocuments();
                    beneficiary.unverifiedDetail = randomIntFromRange(0, beneficiary.totalDetail);
                    beneficiary.totalRules = randomIntFromRange(0, 1000);
                    beneficiary.unfollowedRules = randomIntFromRange(0, beneficiary.totalRules);
                    beneficiary.risk = RISK_CHOICES[randomIntFromRange(0, RISK_CHOICES.length -1)]
                    beneficiary.rules = instance.rules;
                    beneficiary.aadhaarNumber = {
                        data: beneficiary.aadhaarNumber,
                        status: STATUS_CHOICES[randomIntFromRange(0, STATUS_CHOICES.length -1)]
                    };
                    beneficiary.name = {
                        data: beneficiary.name,
                        status: STATUS_CHOICES[randomIntFromRange(0, STATUS_CHOICES.length -1)]
                    };
                    beneficiary.age = {
                        data: beneficiary.age,
                        status: STATUS_CHOICES[randomIntFromRange(0, STATUS_CHOICES.length -1)]
                    };
                    beneficiary.gender = {
                        data: beneficiary.gender,
                        status: STATUS_CHOICES[randomIntFromRange(0, STATUS_CHOICES.length -1)]
                    };
                    beneficiariesData.push(beneficiary);
                }
            }catch (e) {
                sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
            }
            instance.beneficiaries = await beneficiariesData;
            return await instance;
        } catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }

    async addQuestion(req, res, next) {
        try {
            let data = req.body;
            let program = await this.repository.get_object_or_404(res, req.params.uid);
            data.program = program._id;
            let questionRespository = new QuestionRepository();
            let question = await questionRespository.get_object_or_404(res, data.question);
            let [errors, validations] = await getValidationObjects(data.program, question, data);
            if (errors.length != 0) {
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, errors);
            }else {
                let programQuestion = await this.repository.createProgramQuestion(data, validations);
                if(programQuestion.n == 1) {
                    sendResponse(res, responseCodes.HTTP_200_OK, null, {"created": true});
                }else {
                    sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Error while creation");
                }
            }
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }
}

export class FormController extends BaseController {
    constructor() {
        super(FormRepository);
    }

    performCreate(req) {
        try {
            let data = req.body;
            data.user = req.user._id;
            return data;
        }catch (e) {
            console.log(e);
        }
    }
}


export class BeneficiaryController extends BaseController {
    constructor() {
        super(BeneficiaryRepository);
    }

    performCreate(req) {
        try {
            let data = req.body;
            data.users = [req.user._id];
            return data;
        }catch (e) {
            console.log(e);
        }
    }
}

export class QuestionController extends BaseController {
    constructor() {
        super(QuestionRepository);
    }

    async getQuestion(req, res, next) {
        try {
            let questions = await Question.find({});
            sendResponse(res, responseCodes.HTTP_200_OK, null, questions);
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }
}

export class ProgramQuestionController {
    constructor() {
    }

    async submitAnswer(req, res, next) {
        try {
            let data = req.body;
            let questionRepository = new QuestionRepository();
            let errors = {};

            for(let datum of data) {
                let [success, error] = [false, null];
                let question = await questionRepository.get_object_or_404(res, datum.question);
                [success, error] = await validateAnswer(question, datum);
                if (!success) {
                    errors[datum.programQuestion] = {
                        "question": datum.question,
                        "program": datum.program,
                        "error": error
                    }
                }
            }
            if (isEmpty(errors)) {
                let formQuestionRepository = new FormQuestionRepository();
                let answer = await formQuestionRepository.createAnswer(data, req.user);
                sendResponse(res, responseCodes.HTTP_200_OK, null, answer);
            }else{
                sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, errors);
            }
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }
}


export class ImageController {
    uploadImageSetting() {
        try {
            let storage = multer.diskStorage({
                destination: (req, file, callback)=> {
                    callback(null, mediaPath);
                },
                filename: (req, file, cb) => {
                    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop())
                }
            });
            let upload = multer({storage: storage});
            return upload.fields([{ name: 'image', maxCount: 1 }]);
        }catch (e) {
            console.log(e);
        }
    }

    uploadImage(req, res, next) {
        try {
            let data = {
                url: apiBaseUrl + req.files.image[0].path
            };
            sendResponse(res, responseCodes.HTTP_200_OK, null, data);
        }catch (e) {
            sendResponse(res, responseCodes.HTTP_500_INTERAL_SERVER_ERROR, e);
        }
    }
}
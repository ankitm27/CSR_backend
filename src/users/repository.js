import {BaseRepository} from "../contrib/repository";
import {Beneficiary, Form, FormQuestion, Program, User, Question, Validation, Answer} from "./model";
import {getValidations} from "../utils/helpers";
import mongoose from "mongoose";


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

    async getBenefeciaries(program_id) {
        return await Answer.find({program: program_id}).distinct('beneficiary').countDocuments();
    }

    async createProgramQuestion(data, validations) {
        try {
            let validationIds = [];
            let validationsData = await Validation.collection.insertMany(validations);
            let programQuestion = await {
                question: data.question,
                title: data.title,
                mandatory: true,
                description: data.description != undefined ? data.description : null,
                keyword: data.keyword != undefined ? data.keyword : null,
                validations: await Object.values(validationsData.insertedIds),
            };
            let program = await Program.updateOne({_id: data.program}, {$push: {questions: programQuestion}});
            return await program;
        }catch (e) {
            console.log(e);
        }
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

    async generateUniqueNumber() {
        let aadhaarNumber = Math.floor(Math.random() * 9999999999) + 100000000000;
        if (await Beneficiary.find({aadhaarNumber: aadhaarNumber}).countDocuments() > 0) {
            return this.generateUniqueNumber();
        }else {
            return aadhaarNumber;
        }
    }
}

export class QuestionRepository extends BaseRepository {
    constructor() {
        super(Question);
    }

    async updateResponse(questions) {
        return await Promise.all(questions.map(async (questionInstance) => {
            let question = await questionInstance.toObject();
            question.validators = await getValidations(questionInstance.validatorNames);
            return await question;
        }));
    }
}

export class FormQuestionRepository{
    constructor() {
    }

    async createAnswer(data, user) {
        try {
            let beneficiaryRespository = new BeneficiaryRepository();
            let beneficiary = await beneficiaryRespository.create({
                aadhaarNumber: await beneficiaryRespository.generateUniqueNumber(),
                users: [user._id]
            });
            let response = await data.map(async(datum) => {
                datum.beneficiary = beneficiary._id;
                return await Answer.create(datum);
            });
            return await Promise.all(response);
        }catch (e) {
            console.log(e);
        }
    }
}
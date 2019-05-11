import {BaseRepository} from "../contrib/repository";
import {Beneficiary, Form, FormQuestion, Program, User, Question, Validation, Answer} from "./model";
import {getValidations, randomIntFromRange} from "../utils/helpers";
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

    async createProgramQuestion(data, program) {
        try {
            let programQuestionData = [];
            for (let datum of data) {
                let validationsData = await Validation.collection.insertMany(datum.validations);
                programQuestionData.push(await {
                    question: datum.question,
                    title: datum.title,
                    mandatory: true,
                    description: datum.description != undefined ? datum.description : null,
                    keyword: datum.keyword != undefined ? datum.keyword : null,
                    validations: await Object.values(validationsData.insertedIds),
                });
            }
            let programs = await Program.updateOne(
                {_id: program._id},
                {$push: {questions: {$each: programQuestionData}}},
            );
            return await programs;
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
        let aadhaarNumber = randomIntFromRange(100000000000, 9999999999);
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
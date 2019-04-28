import {emailRegex, mobileRegex, urlRegex} from '../utils/customRegex';
import mongoose from "mongoose";
import mongoose_timestamp from "mongoose-timestamp";

let ROLE_CHOICES = Object.freeze({
    ADMIN: "admin",
    VOLUNTEER: "volunteer",
});

let BeneficiarySchema = new mongoose.Schema({
    aadhaarNumber: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        required: [true, 'Aadhaar number is required'],
        minlength: [12, "Aadhaar number length must be greater than equal to 12"],
        maxlength: [12, "Aadhaar number length must be less than equal to 12"],
        // validate: {
        //     validator: email => emailRegex.test(email),
        //     message: props => `${props.value} is not a valid email address`
        // }
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [100, "Atmost 50 characters are allowed"]
    },
    age: {
        type: Number,
        minlength: [1, "Minimum age is not less than 0"],
        maxlength: [150, "Maximim age is not greater than 150"]
    },
    gender: {
        type: String,
        enum: ['female', 'male', 'trans'],
        maxlength: [10, "More than 10 characters are not allowed"]
    },
});

BeneficiarySchema.plugin(mongoose_timestamp);

let Beneficiary = mongoose.model('Beneficiary', BeneficiarySchema);

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        // required: [true, 'Email is required'],
        minlength: [3, "Email length must be greater than equal to 3"],
        maxlength: [254, "Email length must be less than equal to 254"],
        validate: {
            validator: email => emailRegex.test(email),
            message: props => `${props.value} is not a valid email address`
        }
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [50, "Atmost 50 characters are allowed"]
    },
    lastName: {
        type: String,
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [50, "Atmost 50 characters are allowed"]
    },
    mobile: {
        type: String,
        index: true,
        unique: true,
        required: [true, 'Mobile is required'],
        minlength: [10, "Atleast 10 characters are required"],
        maxlength: [15, "Atmost 15 characters are allowed"],
        validate: {
            validator: mobile => mobileRegex.test(mobile),
            message: props => `${props.value} is not a valid mobile`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    dob: {
        type: Date,
        min: Date('1950-01-01T00:00:00'),
        max: Date.now()
    },
    gender: {
        type: String,
        enum: ['female', 'male', 'trans'],
        maxlength: [10, "More than 10 characters are not allowed"]
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    mobileVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: Object.values(ROLE_CHOICES),
        maxlength: [20, "More than 20 characters are not allowed"],
        required: [true, 'Role is required'],
    },
    allowLoggedIn: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        validate: {
            validator: profileImage => urlRegex.test(),
            message: props => `${props.value} is not a valid mobile`
        }
    },
    beneficiaries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Beneficiary,
    }]
});

UserSchema.plugin(mongoose_timestamp);

let User = mongoose.model('User', UserSchema);

let ProgramSchema = new mongoose.Schema({
    user: {
        required: [true, 'User is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [100, "Atmost 100 characters are allowed"]
    },
    description: {
        type: String,
        maxlength: [500, "Atmost 500 characters are allowed"]
    },
    endEate: {
        type: Date,
        min: Date('1950-01-01T00:00:00')
    }

});

ProgramSchema.plugin(mongoose_timestamp);

let Program = mongoose.model('Program', ProgramSchema);

let FormSchema = new mongoose.Schema({
    user: {
        required: [true, 'User is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    program: {
        required: [true, 'Program is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: Program,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [100, "Atmost 100 characters are allowed"]
    },
    description: {
        type: String,
        maxlength: [500, "Atmost 500 characters are allowed"]
    },
    beneficiaries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Beneficiary,
    }]
});

FormSchema.plugin(mongoose_timestamp);

let Form = mongoose.model('Form', FormSchema);

let QUESTION_TYPE_CHOICES = Object.freeze({
    CHOICE: "choice",
    STRING: "string",
    NUMBER: "number",
    FILE: "file",
    BREAK: "break",
    PHONE: "phone",
    EMAIL: "email",
    DATETIME: "datetime",
});

let QuestionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [100, "Atmost 100 characters are allowed"]
    },
    questionType: {
        type: String,
        enum: Object.values(QUESTION_TYPE_CHOICES),
        required: [true, 'Question type is required'],
        minlength: [3, "Atleast 3 characters are required"],
        maxlength: [20, "Atmost 20 characters are allowed"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    multiple: {
        type: Boolean,
        strict: false,
    },
    extension: {
        type: Object,
        strict: false
    },
    validations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Validation
    }]
});

QuestionSchema.plugin(mongoose_timestamp);

let Question = mongoose.model('Question', QuestionSchema);

let FormQuestionSchema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Form,
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Question,
    },
    beneficiaries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Beneficiary,
    }],
    title: {
        type: String,
        required: [true, "Title is required"],
        maxlength: [500, "Atmost 500 characters are allowed"]
    },
    mandatory: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
    },
    keyword: {
        type: String,
        maxlength: [100, "Atmost 100 characters are allowed"]
    },
    optionValue: {
        type: Object,
        strict: false
    },
    randomOption: {
        type: Boolean,
        strict: false
    },
    validationResult: {
        type: Object,
        default: {}
    }
});

FormQuestionSchema.plugin(mongoose_timestamp);

let FormQuestion = mongoose.model('FormQuestion', FormQuestionSchema);

let VALIDATION_NAME_CHOICES = Object.freeze({
    MIN_LENGTH: "min-length",
    MAX_LENGTH: "max-length"
});

let ValidationSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique: true,
        enum: Object.values(VALIDATION_NAME_CHOICES),
        minlength: 3,
        maxlength: 20
    },
    isValidate:{
        type: Boolean,
        default: true
    },
    minLength: {
        type: Number,
        strict: true
    },
    maxLength: {
        type: Number,
        strict: true
    },

});

ValidationSchema.plugin(mongoose_timestamp);

let Validation = mongoose.model('Validation', ValidationSchema);

export default {QUESTION_TYPE_CHOICES, VALIDATION_NAME_CHOICES, ROLE_CHOICES};

export {User, Program, Form, Beneficiary, Question, FormQuestion, Validation};

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
        validate: {
            validator: aadhaarNumbe => aadhaarNumberRegex.test(aadhaarNumbe),
            message: props => `${props.value} is not a valid aadhaar number`
        }
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
    LOCATION: "location"
});

let VALIDATION_NAME_CHOICES = Object.freeze({
    MIN: "min",
    MAX: "max",
    NUMBER_FIELD_TYPE: "numberFieldType",
    LOCATION_FIELD_TYPE: "locationFieldType",
    ACCURACY: "accuracy",
    DATE_FORMAT: "dateFormat",
    TIME_FORMAT: "timeFormat",
    AREA_UNIT: "areaUnit",
    LENGTH_UNIT: "lengthUnit",
    IMAGE_RESOLUTION: "imageResolution",
    VIDEO_RESOLUTION: "videoResolution"
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
        default: false
    },
    // extension: {
    //     type: Object,
    //     strict: false
    // },
    validatorNames: [{
        type: String,
        enum: Object.values(VALIDATION_NAME_CHOICES)
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
    validations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Validation
    }]
});

FormQuestionSchema.plugin(mongoose_timestamp);

let FormQuestion = mongoose.model('FormQuestion', FormQuestionSchema);

let NUMBER_FIELD_TYPE_CHOICES = Object.freeze({
    INT: "int",
    DECIMAL: "decimal",
});
let LOCATION_FIELD_TYPE_CHOICES = Object.freeze({
    CURRENT: "current",
    MARKED: "marked",
});

let ACCURACY_CHOICES = Object.freeze({
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
});

let DATE_FORMAT_CHOICES = Object.freeze({
    DDMMYYYY: "DD/MM/YYYY",
    MMDDYYYY: "MM/DD/YYYY",
    YYYYDDMM: "YYYY/DD/MM",
    MMYYYYDD: "MM/YYYY/DD",
    YYYYMMDD: "YYYY/MM/DD",
    DDYYYYMM: "DD/YYYY/MM",
});

let TIME_FORMAT_CHOICES = Object.freeze({
    TWELVE: "twelve",
    TWENTY_FOUR: "twenty-four",
});

let AREA_UNIT_CHOICES = Object.freeze({
    SQ_MT: "square-meter",
    SQ_KM: "square-kilometer",
    SQ_MI: "square-mile",
    SQ_FT: "square-foot",
    HT: "hectare",
    AC: "acre",
});

let LENGTH_UNIT_CHOICES = Object.freeze({
    MT: "meter",
    KM: "kilometer",
    MI: "mile",
    FT: "foot",
    YD: "yard"
});

let IMAGE_RESOLUTION_CHOICES = Object.freeze({
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
});

let VIDEO_RESOLUTION_CHOICES = Object.freeze({
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
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
    min: {
        type: Number,
        strict: false
    },
    max: {
        type: Number,
        strict: false
    },
    numberFieldType: {
        type: String,
        enum: Object.values(NUMBER_FIELD_TYPE_CHOICES),
        default: NUMBER_FIELD_TYPE_CHOICES.INT,
        strict: false
    },
    locationFieldType: {
        type: String,
        enum: Object.values(LOCATION_FIELD_TYPE_CHOICES),
        default: LOCATION_FIELD_TYPE_CHOICES.CURRENT,
        strict: false
    },
    accuracy: {
        type: String,
        enum: Object.values(ACCURACY_CHOICES),
        default: ACCURACY_CHOICES.MEDIUM,
        strict: false
    },
    dateFormat: {
        type: String,
        enum: Object.values(DATE_FORMAT_CHOICES),
        default: DATE_FORMAT_CHOICES.DDMMYYYY,
        strict: false
    },
    timeFormat: {
        type: String,
        enum: Object.values(TIME_FORMAT_CHOICES),
        default: TIME_FORMAT_CHOICES.TWELVE,
        strict: false
    },
    areaUnit: {
        type: String,
        enum: Object.values(AREA_UNIT_CHOICES),
        default: AREA_UNIT_CHOICES.SQ_FT,
        strict: false
    },
    lengthUnit: {
        type: String,
        enum: Object.values(LENGTH_UNIT_CHOICES),
        default: LENGTH_UNIT_CHOICES.SQ_FT,
        strict: false
    },
    imageResolution: {
        type: String,
        enum: Object.values(IMAGE_RESOLUTION_CHOICES),
        default: IMAGE_RESOLUTION_CHOICES.LOW,
        strict: false
    },
    videoResolution: {
        type: String,
        enum: Object.values(VIDEO_RESOLUTION_CHOICES),
        default: VIDEO_RESOLUTION_CHOICES.LOW,
        strict: false
    }
});

ValidationSchema.plugin(mongoose_timestamp);

let Validation = mongoose.model('Validation', ValidationSchema);

export {
    QUESTION_TYPE_CHOICES,
    VALIDATION_NAME_CHOICES,
    ROLE_CHOICES,
    VIDEO_RESOLUTION_CHOICES,
    IMAGE_RESOLUTION_CHOICES,
    LENGTH_UNIT_CHOICES,
    AREA_UNIT_CHOICES,
    DATE_FORMAT_CHOICES,
    TIME_FORMAT_CHOICES,
    ACCURACY_CHOICES,
    LOCATION_FIELD_TYPE_CHOICES,
};

export {User, Program, Form, Beneficiary, Question, FormQuestion, Validation};

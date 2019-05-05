import {emailRegex, mobileRegex, urlRegex} from '../utils/customRegex';
import mongoose from "mongoose";
import mongoose_timestamp from "mongoose-timestamp";
import uuidv4 from "uuid/v4";

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
            validator: aadhaarNumber => !isNaN(aadhaarNumber),
            message: props => `${props.value} is not a valid aadhaar number`
        }
    },
    name: {
        type: String,
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
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
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
    organizationType: {
        type: String
    }
});

UserSchema.plugin(mongoose_timestamp);

let User = mongoose.model('User', UserSchema);

let STATUS_CHOICES = Object.freeze({
    OPEN: 'open',
    CLOSED: 'closed'
});

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
    startDate: {
        type: Date,
        min: Date('1950-01-01T00:00:00Z')
    },
    status: {
        type: String,
        enum: Object.values(STATUS_CHOICES),
        default: STATUS_CHOICES.OPEN
    },
    goal: {
        type: String,
        maxlength: [200, "Atmost 200 characters are allowed"]
    },
    goalAchieved: {
        type: Number,
        min: [0, "Percentage should not less than 0"],
        max: [100, "Percentage should not greater than 100"],
        default: 0
    },
    endDate: {
        type: Date,
        min: Date('1950-01-01T00:00:00Z')
    },
    funding: {
        type: Number,
        min: [0, "Funding should not less than 0"]
    },
    targetBeneficiary: {
        type: Number,
        min: [1, "Atleast one beneficiary required"]
    },
    average: {
        type: Number,
        min: [0, "Percentage should not less than 0"],
        max: [100, "Percentage should not greater than 100"],
        default: 0
    },
    good: {
        type: Number,
        min: [0, "Percentage should not less than 0"],
        max: [100, "Percentage should not greater than 100"],
        default: 0
    },
    bad: {
        type: Number,
        min: [0, "Percentage should not less than 0"],
        max: [100, "Percentage should not greater than 100"],
        default: 0
    },
    supervisors: [{
        employee_code: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: email => emailRegex.test(email),
                message: props => `${props.value} is not a valid email address`
            }
        },
        mobile: {
            type: String,
            required: true,
            validate: {
                validator: mobile => mobileRegex.test(mobile),
                message: props => `${props.value} is not a valid mobile`
            }
        },
        country: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
    }],
    ngo: {
        ngoName: {
            type: String,
            required: true
        },
        managerFirstName: {
            type: String,
            required: true
        },
        managerLastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: email => emailRegex.test(email),
                message: props => `${props.value} is not a valid email address`
            }
        },
        mobile: {
            type: String,
            required: true,
            validate: {
                validator: mobile => mobileRegex.test(mobile),
                message: props => `${props.value} is not a valid mobile`
            }
        },
        country: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
    },
    rules: [{
        componentName: {
            type: String
        },
        rules: [{
            type: String
        }]
    }],
    questions: [{
        _id: {
            type: String,
            default: uuidv4
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
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
        validations: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Validation'
        }]
    }]
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
    }],
    questions: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
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
        validations: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Validation'
        }]
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
    DATE: "date",
    TIME: "time",
    LOCATION: "location",
    SCALE: "scale",
    RATING: "rating",
    BARCODE: "barcode",
});

let VALIDATION_NAME_CHOICES = Object.freeze({
    MIN: "min",
    MAX: "max",
    RANDOM_OPTION: "randomOption",
    OPTION_VALUE: "optionValue",
    ALLOW_DECIMAL: "allowDecimal",
    ALLOW_MARKED_LOCATION: "allowMarkedLocation",
    LOCATION_ACCURACY: "locationAccuracy",
    DATE_FORMAT: "dateFormat",
    TIME_FORMAT: "timeFormat",
    AREA_UNIT: "areaUnit",
    LENGTH_UNIT: "lengthUnit",
    ALLOW_GALLERY: "allowGallery",
    IMAGE_RESOLUTION: "imageResolution",
    VIDEO_RESOLUTION: "videoResolution",
    COUNTRY_CODE: "countryCode",
    STEP_SIZE: "stepSize",
    MULTIPLE: "multiple",
});

let isValidateList = [
    VALIDATION_NAME_CHOICES.MIN,
    VALIDATION_NAME_CHOICES.MAX,
    VALIDATION_NAME_CHOICES.ALLOW_DECIMAL,
    VALIDATION_NAME_CHOICES.DATE_FORMAT,
    VALIDATION_NAME_CHOICES.TIME_FORMAT,
    VALIDATION_NAME_CHOICES.STEP_SIZE,
    VALIDATION_NAME_CHOICES.MULTIPLE,
    VALIDATION_NAME_CHOICES.OPTION_VALUE,
];

let IS_VALIDATE_LIST = Object.freeze(isValidateList);

let EXTENSION_CHOICES = Object.freeze({
    JPG: "jpg",
    GIF: "gif",
    JPEG: "jpeg",
    PNG: "png",
    MP3: "mp3",
    WAV: "wav",
    MP4: "mp4",
    AVI: "avi",
    FLV: "flv",
    WMV: "wmv",
    MOV: "mov",

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
    validatorRules: {
        type: Object,
    },
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
    validations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Validation
    }]
});

FormQuestionSchema.plugin(mongoose_timestamp);

let FormQuestion = mongoose.model('FormQuestion', FormQuestionSchema);

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
    TWELVE: "hh:mm:ss a",
    TWENTY_FOUR: "HH:mm:ss",
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
    P1020: "1020p",
    P720: "720p",
    P480: "480p",
});

let COUNTRY_CODE_CHOICES = Object.freeze({
    INDIA: "+91"
});

let ValidationSchema = new mongoose.Schema({
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },
    name: {
        type: String,
        enum: Object.values(VALIDATION_NAME_CHOICES),
        minlength: 3,
        maxlength: 20
    },
    isValidate: {
        type: Boolean,
        default: true
    },
    min: {
        type: Number,
        min: 1,
        strict: false
    },
    max: {
        type: Number,
        min: 1,
        strict: false
    },
    optionValue: {
        type: Object,
        strict: false
    },
    randomOption: {
        type: Boolean,
        strict: false
    },
    multiple: {
        type: Boolean,
        strict: false
    },
    allowDecimal: {
        type: Boolean,
        default: true,
        strict: false
    },
    allowMarkedLocation: {
        type: Boolean,
        default: true,
        strict: false
    },
    locationAccuracy: {
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
    allowGallery: {
        type: Boolean,
        strict: false
    },
    countryCode: [{
        type: String,
        enum: Object.values(COUNTRY_CODE_CHOICES),
        strict: false
    }],
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
    },
    stepSize: {
        type: Number,
        min: 1,
        strict: false
    },
});

ValidationSchema.plugin(mongoose_timestamp);

let Validation = mongoose.model('Validation', ValidationSchema);

let VALIDATOR_TYPE_CHOICES = Object.freeze({
    NUMBER: "number",
    OBJECT: "object",
    BOOLEAN: "boolean",
    CHOICE: "choice",
});

let validatorsInfo = {};
validatorsInfo[VALIDATION_NAME_CHOICES.MIN] = {
    type: VALIDATOR_TYPE_CHOICES.NUMBER,
    min: 1,
    default: 1,
};
validatorsInfo[VALIDATION_NAME_CHOICES.MAX] = {
    type: VALIDATOR_TYPE_CHOICES.NUMBER,
    min: 1,
    default: 1,
};
validatorsInfo[VALIDATION_NAME_CHOICES.OPTION_VALUE] = {
    type: VALIDATOR_TYPE_CHOICES.OBJECT,
    default: null,
};
validatorsInfo[VALIDATION_NAME_CHOICES.RANDOM_OPTION] = {
    type: VALIDATOR_TYPE_CHOICES.BOOLEAN,
    default: false,
};
validatorsInfo[VALIDATION_NAME_CHOICES.MULTIPLE] = {
    type: VALIDATOR_TYPE_CHOICES.BOOLEAN,
    default: false,
};
validatorsInfo[VALIDATION_NAME_CHOICES.ALLOW_DECIMAL] = {
    type: VALIDATOR_TYPE_CHOICES.BOOLEAN,
    default: true
};
validatorsInfo[VALIDATION_NAME_CHOICES.ALLOW_MARKED_LOCATION] = {
    type: VALIDATOR_TYPE_CHOICES.BOOLEAN,
    default: true
};
validatorsInfo[VALIDATION_NAME_CHOICES.LOCATION_ACCURACY] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: ACCURACY_CHOICES,
    default: ACCURACY_CHOICES.MEDIUM
};
validatorsInfo[VALIDATION_NAME_CHOICES.DATE_FORMAT] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: DATE_FORMAT_CHOICES,
    default: DATE_FORMAT_CHOICES.DDMMYYYY
};
validatorsInfo[VALIDATION_NAME_CHOICES.TIME_FORMAT] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: TIME_FORMAT_CHOICES,
    default: TIME_FORMAT_CHOICES.TWELVE
};
validatorsInfo[VALIDATION_NAME_CHOICES.AREA_UNIT] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: AREA_UNIT_CHOICES,
    default: AREA_UNIT_CHOICES.SQ_MT
};
validatorsInfo[VALIDATION_NAME_CHOICES.LENGTH_UNIT] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: LENGTH_UNIT_CHOICES,
    default: LENGTH_UNIT_CHOICES.MT
};
validatorsInfo[VALIDATION_NAME_CHOICES.ALLOW_GALLERY] = {
    type: VALIDATOR_TYPE_CHOICES.BOOLEAN,
    default: true
};
validatorsInfo[VALIDATION_NAME_CHOICES.COUNTRY_CODE] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: COUNTRY_CODE_CHOICES,
    default: COUNTRY_CODE_CHOICES.INDIA
};
validatorsInfo[VALIDATION_NAME_CHOICES.IMAGE_RESOLUTION] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: IMAGE_RESOLUTION_CHOICES,
    default: IMAGE_RESOLUTION_CHOICES.MEDIUM
};
validatorsInfo[VALIDATION_NAME_CHOICES.VIDEO_RESOLUTION] = {
    type: VALIDATOR_TYPE_CHOICES.CHOICE,
    choices: VIDEO_RESOLUTION_CHOICES,
    default: VIDEO_RESOLUTION_CHOICES.P720
};
validatorsInfo[VALIDATION_NAME_CHOICES.STEP_SIZE] = {
    type: VALIDATOR_TYPE_CHOICES.NUMBER,
    min: 1,
    default: 1
};

let VALIDATOR_INFO = Object.freeze(validatorsInfo);

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
    EXTENSION_CHOICES,
    VALIDATOR_TYPE_CHOICES,
    VALIDATOR_INFO,
    IS_VALIDATE_LIST,
    STATUS_CHOICES
};


let AnswerSchema = new mongoose.Schema({
    programQuestion: {
        type: String,
        required: [true, 'Program question is required'],
    },
    program: {
        required: [true, 'Program is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: Program,
    },
    question: {
        required: [true, 'Question is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },
    beneficiary: {
        required: [true, 'Beneficiary is required'],
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Beneficiary',
    },
    answer: {
        type: String,
        required: true
    }
});

AnswerSchema.plugin(mongoose_timestamp);

let Answer = mongoose.model('Answer', AnswerSchema);

export {User, Program, Form, Beneficiary, Question, FormQuestion, Validation, Answer};
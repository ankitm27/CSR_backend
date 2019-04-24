import {emailRegex, mobileRegex} from '../utils/customRegex';
import mongoose from "mongoose";
import mongoose_timestamp from "mongoose-timestamp";


let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        required: [true, 'Email is required'],
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
    }
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
    }
});

FormSchema.plugin(mongoose_timestamp);

let Form = mongoose.model('Form', FormSchema);

export {User, Program, Form};

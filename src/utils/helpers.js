import * as Sentry from "@sentry/node";
import bcrypt from "bcrypt";
import multer from "multer";
import {dsn} from "../settings/config";
import {
    IS_VALIDATE_LIST,
    QUESTION_TYPE_CHOICES, Validation,
    VALIDATION_NAME_CHOICES,
    VALIDATOR_INFO,
    VALIDATOR_TYPE_CHOICES
} from "../users/model";
import util from "util";
import moment from "moment";
import {emailRegex, mobileRegex} from "./customRegex";
import responseCodes, {sendResponse} from "../contrib/response.py";

Sentry.init({dsn: dsn});

const saltRounds = 10;

export function sendSentryMessage(message) {
    Sentry.captureMessage(message);
}

export function sendSentryError(error) {
    Sentry.captureException(error);
}

export function makeHash(myPlaintextPassword) {
    return bcrypt.hashSync(myPlaintextPassword, saltRounds);
}

export function compareHash(myPlaintextPassword, hashPassword) {
    return bcrypt.compareSync(myPlaintextPassword, hashPassword);
}

export function getRequestUrl(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

export function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export function isSuperset(set, subset) {
    for (let element of subset) {
        if (!set.has(element)) {
            return false;
        }
    }
    return true;
}

export function getValidations(validatorNames) {
    return validatorNames.map((validatorName) => {
        let data = {};
        data[validatorName] = VALIDATOR_INFO[validatorName];
        return data;
    });
}

export function questionValidation(program_id, question, data, validatorName) {
    let validator = VALIDATOR_INFO[validatorName];
    let validatorValue_in_data = data[validatorName] == undefined ? validator.default : data[validatorName];
    let error = null;
    // If validatorName is not present in data or set default as null in validators
    if (validatorValue_in_data == null) {
        error = util.format("%s is required", validatorName);
    }
    // If validator type is number and validatorName value is less than min value present on validator
    else if(validator.type == VALIDATOR_TYPE_CHOICES.NUMBER && validatorValue_in_data < validator.min) {
        error = util.format("%s must greater than %s", validatorName, validator.min);
    }
    // If min and max type of validations
    else if ([VALIDATION_NAME_CHOICES.MIN, VALIDATION_NAME_CHOICES.MAX].includes(validatorName)){
        let currentValueLength = null;
        // for choice then their value should not greater than length of option value
        if(question.questionType == QUESTION_TYPE_CHOICES.CHOICE) {
            currentValueLength = Object.keys(
                (data[VALIDATION_NAME_CHOICES.optionValue]) instanceof Array || typeof(data[VALIDATION_NAME_CHOICES.optionValue]) != VALIDATOR_TYPE_CHOICES.OBJECT ? [] : data[VALIDATION_NAME_CHOICES.optionValue]
            ).length;
            if(currentValueLength != null && validatorValue_in_data > currentValueLength) {
                error = util.format("%s must less than %s", validatorName, currentValueLength);
            }
        }
        // Not selected float value when allowDecimal is integer
        else if(!data[VALIDATION_NAME_CHOICES.ALLOW_DECIMAL] && !Number.isInteger(validatorValue_in_data)) {
            error = util.format("Invalid value %s for %s, integer required", validatorValue_in_data, validatorName);
        }
    }
    // Validation for maximum step size
    else if (validatorName == VALIDATION_NAME_CHOICES.STEP_SIZE) {
        let maxStepSize = data[VALIDATION_NAME_CHOICES.MAX] || VALIDATOR_INFO[VALIDATION_NAME_CHOICES.MAX].min -
            data[VALIDATION_NAME_CHOICES.MIN] || VALIDATOR_INFO[VALIDATION_NAME_CHOICES.MIN].min;
        if (data[VALIDATION_NAME_CHOICES.STEP_SIZE] > maxStepSize) {
            error = util.format("Max %s allowed is not more than %s", validatorName, maxStepSize);
        }
    }
    if (error == null){
        let response = {
            name: validatorName,
            isValid: IS_VALIDATE_LIST.includes(validatorName),
            question: question._id,
            program: program_id
        };
        response[validatorName] = validatorValue_in_data;
        return response;
    }else {
        return error;
    }
}

export async function getValidationObjects(program_id, question, data) {
    let validatorNames = question.validatorNames;
    let errors = [];
    let validations = [];
    for(let validatorName of validatorNames) {
        let response = questionValidation(program_id, question, data, validatorName);
        if (typeof(response) == "string") {
            errors.push(response);
        }else {
            validations.push(response);
        }
    }
    return [errors, validations];
}

export async function getValidators(question, validators) {
    let data = {};
    let validations = await Validation.find({_id: {$in: validators }});
    validations.forEach((validation) => {
        data[validation.name] = validation[validation.name];
    });
    return await data;
}

export async function validateAnswer(question, data) {
    try {
        let validators = await getValidators(question, data.validations);
        let questionType = question.questionType;
        let answer = data.answer;
        let date = Date.now();
        let error = null;
        if ([QUESTION_TYPE_CHOICES.CHOICE, QUESTION_TYPE_CHOICES.LOCATION].includes(questionType)) {
            answer = answer.split('#');
            if(questionType == QUESTION_TYPE_CHOICES.LOCATION) {
                if(answer.length != 2) {
                    error = "Invalid location provided"
                }else {
                    let [lat, long] = answer;
                    if ((isNaN(lat) || lat > 90 || lat < -90) && (isNaN(long) || long > 90 || long < -90)) {
                        error = "Invalid latitude and longitude values";
                    }else if (isNaN(lat) || lat > 90 || lat < -90) {
                        error = "Invalid latitude value";
                    }else if(isNaN(long) || long > 90 || long < -90) {
                        error = "Invalid longitude value";
                    }
                }
            }
        }else if ([QUESTION_TYPE_CHOICES.NUMBER, QUESTION_TYPE_CHOICES.SCALE,
            QUESTION_TYPE_CHOICES.RATING].includes(questionType)) {
            if (isNaN(answer)) {
                error = "Not a number";
            }
            answer = Number(answer);
        }else if (questionType == QUESTION_TYPE_CHOICES.DATE) {
            if(!moment(answer, validators[VALIDATION_NAME_CHOICES.DATE_FORMAT]).isValid()) {
                error = "Invalid date format";
            }
            answer = moment(answer, validators[VALIDATION_NAME_CHOICES.DATE_FORMAT])
        }else if (questionType == QUESTION_TYPE_CHOICES.TIME) {
            if(!moment("DD/MM/YYYY" + answer, "DD/MM/YYYY", validators[VALIDATION_NAME_CHOICES.TIME_FORMAT]).isValid()) {
                error = "Invalid date format";
            }
            answer = moment("01/01/2019" + answer, "DD/MM/YYYY", validators[VALIDATION_NAME_CHOICES.TIME_FORMAT])
        }else if(questionType == QUESTION_TYPE_CHOICES.PHONE && !mobileRegex.test(answer)) {
            error = "Invalid phone number";
        }else if(questionType == QUESTION_TYPE_CHOICES.EMAIL && !emailRegex.test(answer)) {
            error = "Invalid email address";
        }else if(questionType == QUESTION_TYPE_CHOICES.RATING && (answer < 0 || answer > 5)) {
            error = "Invalid ratings";
        }

        if (error == null && (answer == undefined || answer == null || answer == [])) {
            error = "Answer is required";
        }else if(error == null) {
            for (let validatorKey of Object.keys(validators)) {
                let validatorValue = validators[validatorKey];
                if(validatorKey == VALIDATION_NAME_CHOICES.MIN) {
                    if(questionType == QUESTION_TYPE_CHOICES.CHOICE && validators[VALIDATION_NAME_CHOICES.MULTIPLE] &&
                        answers.length > validatorValue) {
                        error =util.format("Select more than to %s choice", validatorValue - 1);
                    }else if(questionType == QUESTION_TYPE_CHOICES.STRING && answer.length < validatorValue) {
                        error = util.format("String length must more than %s characters", validatorValue - 1);
                    }else if(questionType == QUESTION_TYPE_CHOICES.NUMBER && answer < validatorValue) {
                        error = util.format("Number must greater than %s", validatorValue - 1);
                    }else if (questionType == QUESTION_TYPE_CHOICES.DATE && validatorValue != 1 &&
                        answer < validatorValue) {
                        error = util.format("Date must greater than or equal to %s", String(answer));
                    }else if (questionType == QUESTION_TYPE_CHOICES.TIME && validatorValue != 1 &&
                        answer < validatorValue) {
                        error = util.format("Date must greater than or equal to %s", String(answer));
                    }else if (questionType == QUESTION_TYPE_CHOICES.TIME && validatorValue != 1 &&
                        answer < moment(validatorValue).date(1).month(1).year(2019)) {
                        error = util.format("Time must greater than or equal to %s", String(answer));
                    }else if(questionType == QUESTION_TYPE_CHOICES.SCALE &&
                        answer < validatorValue*validators[VALIDATION_NAME_CHOICES.STEP_SIZE]) {
                        error = util.format("Value must greater than %s", String(answer));
                    }
                }else if(validatorKey == VALIDATION_NAME_CHOICES.MAX) {
                    if(questionType == QUESTION_TYPE_CHOICES.CHOICE && validators[VALIDATION_NAME_CHOICES.MULTIPLE] &&
                        answers.length > validatorValue) {
                        error = util.format("Select less than to %s choice", validatorValue - 1);
                    }else if(questionType == QUESTION_TYPE_CHOICES.STRING && answer.length > validatorValue) {
                        error = util.format("String length must less than %s characters", validatorValue - 1);
                    }else if(questionType == QUESTION_TYPE_CHOICES.NUMBER && answer > validatorValue) {
                        error = util.format("Number must less than %s", validatorValue - 1);
                    }else if (questionType == QUESTION_TYPE_CHOICES.DATE && validatorValue != 1 &&
                        answer > validatorValue) {
                        error = util.format("Date must less than or equal to %s", String(answer));
                    }else if (questionType == QUESTION_TYPE_CHOICES.TIME && validatorValue != 1 &&
                        answer > validatorValue) {
                        error = util.format("Date must less than or equal to %s", String(answer));
                    }else if (questionType == QUESTION_TYPE_CHOICES.TIME && validatorValue != 1 &&
                        answer > moment(validatorValue).date(1).month(1).year(2019)) {
                        error = util.format("Time must less than or equal to %s", String(answer));
                    }else if(questionType == QUESTION_TYPE_CHOICES.SCALE &&
                        answer > validatorValue*validators[VALIDATION_NAME_CHOICES.STEP_SIZE]) {
                        error = util.format("Value must less than %s", String(answer));
                    }
                }else if (validatorKey == VALIDATION_NAME_CHOICES.MULTIPLE && !validatorValue && answer.length > 1) {
                    error = "Select single choice";
                }else if(validatorKey == VALIDATION_NAME_CHOICES.ALLOW_DECIMAL && !validatorValue &&
                    !Number.isInteger(answer)) {
                    error = "Only integer value is allowed";
                }else if(validatorKey == VALIDATION_NAME_CHOICES.OPTION_VALUE) {
                    let requiredValues = new Set(Object.values(validatorValue));
                    let givenValues = new Set(answer);
                    if (!isSuperset(requiredValues, givenValues)){
                        error = "Invalid value for choice";
                    }
                }
                if(error != null) {
                    break;
                }
            }
        }
        if(error == null) {
            return [true, null];
        }else {
            return [false, error];
        }

    }catch (e) {
        console.log(e);
    }
}

// export default storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '/media')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// })
//
//

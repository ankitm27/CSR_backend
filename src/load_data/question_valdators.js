import {VALIDATION_NAME_CHOICES, QUESTION_TYPE_CHOICES} from "../users/model";

data = [
    {
        name: "Text",
        questionType: QUESTION_TYPE_CHOICES.STRING,
        isActive: true,
        multiple: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    },{
        name: "Single Choice",
        questionType: QUESTION_TYPE_CHOICES.CHOICE,
        isActive: true,
        multiple: false,
        validatorNames: [
        ]
    },{
        name: "Multiple Choice",
        questionType: QUESTION_TYPE_CHOICES.CHOICE,
        isActive: true,
        multiple: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    },{
        name: "Number",
        questionType: QUESTION_TYPE_CHOICES.NUMBER,
        isActive: true,
        multiple: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    }
];
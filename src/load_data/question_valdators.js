import {VALIDATION_NAME_CHOICES, QUESTION_TYPE_CHOICES, EXTENSION_CHOICES, Question} from "../users/model";
import {sendResponse} from "../contrib/response.py";
import responseCodes from "../contrib/response.py";

let questions = [
    {
        name: "Text",
        questionType: QUESTION_TYPE_CHOICES.STRING,
        isActive: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    },{
        name: "Choice",
        questionType: QUESTION_TYPE_CHOICES.CHOICE,
        isActive: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.OPTION_VALUE,
            VALIDATION_NAME_CHOICES.RANDOM_OPTION,
            VALIDATION_NAME_CHOICES.MULTIPLE,
        ]
    },{
        name: "Number",
        questionType: QUESTION_TYPE_CHOICES.NUMBER,
        isActive: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
            VALIDATION_NAME_CHOICES.ALLOW_DECIMAL,
        ]
    },{
        name: "Location",
        questionType: QUESTION_TYPE_CHOICES.LOCATION,
        isActive: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.LOCATION_ACCURACY,
            VALIDATION_NAME_CHOICES.ALLOW_MARKED_LOCATION,
        ]
    },{
        name: "Date",
        questionType: QUESTION_TYPE_CHOICES.DATE,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.DATE_FORMAT,
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    },{
        name: "Time",
        questionType: QUESTION_TYPE_CHOICES.TIME,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.TIME_FORMAT,
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
        ]
    },{
        name: "Signature",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: false,
        extensions: [
            EXTENSION_CHOICES.GIF,
            EXTENSION_CHOICES.JPEG,
            EXTENSION_CHOICES.JPG,
            EXTENSION_CHOICES.PNG,
        ],
        validatorNames: []
    },{
        name: "Section Break",
        questionType: QUESTION_TYPE_CHOICES.BREAK,
        isActive: false,
        validatorNames: []
    },{
        name: "Area On Map",
        questionType: QUESTION_TYPE_CHOICES.NUMBER,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.AREA_UNIT,
        ]
    },{
        name: "Length On Map",
        questionType: QUESTION_TYPE_CHOICES.NUMBER,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.LENGTH_UNIT,
        ]
    },{
        name: "Image",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: true,
        validatorNames: [
            VALIDATION_NAME_CHOICES.ALLOW_GALLERY,
            VALIDATION_NAME_CHOICES.IMAGE_RESOLUTION,
        ]
    },{
        name: "Image Geo Tag",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.IMAGE_RESOLUTION,
            VALIDATION_NAME_CHOICES.LOCATION_ACCURACY,
        ]
    },{
        name: "Phone",
        questionType: QUESTION_TYPE_CHOICES.PHONE,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.COUNTRY_CODE,
        ]
    },{
        name: "Email",
        questionType: QUESTION_TYPE_CHOICES.EMAIL,
        isActive: false,
        validatorNames: []
    },{
        name: "Audio",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: false,
        extensions: [
            EXTENSION_CHOICES.MP3,
            EXTENSION_CHOICES.WAV,
        ],
        validatorNames: []
    },{
        name: "Video",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: false,
        extensions: [
            EXTENSION_CHOICES.MP4,
            EXTENSION_CHOICES.AVI,
            EXTENSION_CHOICES.FLV,
            EXTENSION_CHOICES.WMV,
            EXTENSION_CHOICES.FLV,
        ],
        validatorNames: []
    },{
        name: "File Upload",
        questionType: QUESTION_TYPE_CHOICES.FILE,
        isActive: false,
        extensions: [],
        validatorNames: []
    },{
        name: "Scale",
        questionType: QUESTION_TYPE_CHOICES.SCALE,
        isActive: false,
        validatorNames: [
            VALIDATION_NAME_CHOICES.MIN,
            VALIDATION_NAME_CHOICES.MAX,
            VALIDATION_NAME_CHOICES.STEP_SIZE,
        ]
    },{
        name: "Rating",
        questionType: QUESTION_TYPE_CHOICES.RATING,
        isActive: false,
        validatorNames: []
    },{
        name: "Barcode",
        questionType: QUESTION_TYPE_CHOICES.BARCODE,
        isActive: false,
        validatorNames: []
    },
];


export async function loadQuestions(req, res, next) {
    try {
        let promises = questions.map(async question => {
            return await Question.findOneAndUpdate(
                {name: question.name},  {$set: question}, {new:true, upsert: true}
            );
        });
        const results = await Promise.all(promises);
        await sendResponse(res, responseCodes.HTTP_200_OK, null, results);
    }catch (e) {
        console.log(e);
    }
}
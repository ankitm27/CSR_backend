import express from 'express';

import {
    BeneficiaryController,
    FormController,
    FormQuestionController,
    ProgramController, QuestionController,
    UserController
} from "./controller";

import {TokenAuthenticationMiddleware} from "../contrib/middleware";
import {loadQuestions} from "../load_data/question_valdators";

let router = express.Router();

let userController = new UserController();
let programController = new ProgramController();
let formController = new FormController();
let beneficiaryController = new BeneficiaryController();
let formQuestionController = new FormQuestionController();
let questionController = new QuestionController();

/* GET users listing. */
router.post('/load-questions', (req, res, next) => {
    loadQuestions(req, res, next);
});
router.post('/login', userController.login);
router.post('/register', userController.register);

router.post('/volunteer/login', (req, res, next) => {
    userController.volunteerLogin(req, res, next);
});

let tokenMiddleWare = new TokenAuthenticationMiddleware();

router.use(tokenMiddleWare.checkToken);

router.post('/volunteer/reset-password', (req, res, next) => {
    userController.resetPassword(req, res, next);
});
router.post('/volunteer/me', (req, res, next) => {
    userController.updateCurrentUserDetail(req, res, next);
});
router.get('/volunteer/me', (req, res, next) => {
    userController.getCurrentUserDetail(req, res, next);
});
router.post('/volunteer/:uid', (req, res, next) => {
    userController.resetPassword(req, res, next);
});
router.get('/program', (req, res, next) => {
    programController.getList(req, res, next);
});
router.get('/program/:uid', (req, res, next) => {
    programController.getDetail(req, res, next);
});
router.post('/program', (req, res, next) => {
    programController.create(req, res, next);
});
router.patch('/program/:uid', (req, res, next) => {
    programController.update(req, res, next);
});
router.delete('/program/:uid', (req, res, next) => {
    programController.delete(req, res, next);
});
router.get('/program/:uid/questions', (req, res, next) => {
    programController.getQuestion(req, res, next);
});


router.get('/form', (req, res, next) => {
    formController.getList(req, res, next);
});
router.get('/form/:uid', (req, res, next) => {
    formController.getDetail(req, res, next);
});
router.post('/form', (req, res, next) => {
    formController.create(req, res, next);
});
router.patch('/form/:uid', (req, res, next) => {
    formController.update(req, res, next);
});
router.delete('/form/:uid', (req, res, next) => {
    formController.delete(req, res, next);
});

router.get('/beneficiary', (req, res, next) => {
    beneficiaryController.getList(req, res, next);
});
router.get('/beneficiary/:uid', (req, res, next) => {
    beneficiaryController.getDetail(req, res, next);
});
router.post('/beneficiary', (req, res, next) => {
    beneficiaryController.create(req, res, next);
});
router.patch('/beneficiary/:uid', (req, res, next) => {
    beneficiaryController.update(req, res, next);
});
router.delete('/beneficiary/:uid', (req, res, next) => {
    beneficiaryController.delete(req, res, next);
});

router.delete('/beneficiary/:uid', (req, res, next) => {
    beneficiaryController.delete(req, res, next);
});

router.get('/question/', (req, res, next) => {
    questionController.getList(req, res, next);
});

router.post('/form-question/', (req, res, next) => {
    formQuestionController.addQuestion(req, res, next);
});
// Classes are used just like ES5 constructor functions:


module.exports = router;

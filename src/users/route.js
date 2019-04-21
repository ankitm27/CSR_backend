import express from 'express';

import {UserController, ProgramController} from "./controller";

import {TokenAuthenticationMiddleware} from "../contrib/middleware";

let router = express.Router();

let userController = new UserController();
let programController = new ProgramController();

let tokenMiddleWare = new TokenAuthenticationMiddleware();

/* GET users listing. */
router.post('/login', userController.login);
router.post('/register', userController.register);

router.use(tokenMiddleWare.checkToken);

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

// Classes are used just like ES5 constructor functions:


module.exports = router;

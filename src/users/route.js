import express from 'express';

import {UserController} from "./controller";

import {TokenAuthenticationMiddleware} from "../contrib/middleware";

let router = express.Router();

let userController = new UserController();

let tokenMiddleWare = new TokenAuthenticationMiddleware();

/* GET users listing. */
router.post('/login', userController.login);
router.post('/register', userController.register);


module.exports = router;
